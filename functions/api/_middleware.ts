import * as jwt from "@tsndr/cloudflare-worker-jwt";
import { User } from "../models/user";
import type { AppFunction } from "../types/appcontext";
import { HttpError, ValidationError } from "../types/httperror";

export const errorHandler: AppFunction = async ctx => {
  try {
    return await ctx.next();
  } catch (err) {
    if (err instanceof ValidationError) {
      const { message, issues, status, flatten } = err;
      let formatted;
      if (flatten) formatted = issues.flatten();
      else formatted = issues.format();
      return Response.json({ error: message, issues: formatted }, { status });
    }
    if (err instanceof HttpError) {
      const { message, status } = err;
      return Response.json({ error: "Bad request", message }, { status });
    }
    console.error(err);
    return Response.json({ error: "An unknown error has ocurred." }, { status: 500 });
  }
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

export const onRequest: AppFunction[] = [errorHandler, authentication];
