import * as jwt from "@tsndr/cloudflare-worker-jwt";

import { HttpError, HttpErrorCode, HttpErrorSchema } from "@/shared/api/types";
import { User } from "@/shared/models/user";
import { setupZodErrorMap } from "@/shared/utils/zod-errors";

import type { AppFunction } from "../types/appcontext";

export const errorHandler: AppFunction = async ctx => {
  try {
    return await ctx.next();
  } catch (err) {
    if (err instanceof HttpError) {
      const response = err.toJSON();
      // Only log server errors to Cloudflare
      if (err.code === HttpErrorCode.ServerError) {
        console.log(err);
      }
      return Response.json(response, { status: err.status });
    }

    // Log to Cloudflare
    console.log(err);
    const response: HttpErrorSchema = {
      error: "Unknown Error",
      message: "An unknown internal server error has occurred.",
      code: HttpErrorCode.UnknownError,
      status: 500,
    };
    return Response.json(response, { status: 500 });
  }
};

export const zodErrorMap: AppFunction = ctx => {
  setupZodErrorMap();
  return ctx.next();
};

export const authentication: AppFunction = async ctx => {
  const url = new URL(ctx.request.url);
  if (url.pathname.startsWith("/api/auth/")) {
    return await ctx.next();
  }

  const header = ctx.request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "No credentials were provided.");
  }

  const token = header.split(" ")[1];
  const isValid = await jwt.verify(token, ctx.env.JWT_SECRET);
  if (!isValid) {
    throw new HttpError(401, "Invalid JWT.");
  }

  const { payload } = jwt.decode(token);
  const { sub: email } = payload;
  if (!email) {
    throw new HttpError(401, "Invalid JWT.");
  }

  const data = await ctx.env.users.get(email);
  if (!data) {
    throw new HttpError(401, "The user associated with this token doesn't exist.");
  }
  const user = JSON.parse(data);
  ctx.data.user = User.parse(user);

  return await ctx.next();
};

// TODO: Gracefully handle non-JSON responses with non-500 errors.
export const onRequest: AppFunction[] = [errorHandler, zodErrorMap, authentication];
