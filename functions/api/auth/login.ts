import * as jwt from "@tsndr/cloudflare-worker-jwt";
import * as bcrypt from "bcryptjs";
import ms from "ms";

import { HttpError, JwtPayload, LoginRequest, LoginResponse } from "@/shared/api/types";
import { SanitizedUser, User } from "@/shared/models/user";

import type { AppFunction } from "../../types/appcontext";
import { parseBody } from "../../utils/model-parser";

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, LoginRequest);

  // Get user from KV
  const data = await ctx.env.users.get(req.email);
  if (!data) {
    throw new HttpError(401, "Invalid email or password.");
  }
  const user = User.parse(JSON.parse(data));

  // Don't allow unverified users to login
  if (!user.verified) {
    throw new HttpError(401, "User is missing email verification.");
  }

  // Verify password
  const isValid = await bcrypt.compare(req.password, user.password);
  if (!isValid) {
    throw new HttpError(401, "Invalid email or password.");
  }

  // Generate token
  const url = new URL(ctx.request.url);
  const payload: JwtPayload = {
    sub: user.email,
    name: user.fullName,
    email: user.email,
    aud: url.hostname,
    exp: Math.floor(Date.now() / 1000 + ms("30d") / 1000),
  };
  const token = await jwt.sign(payload, ctx.env.JWT_SECRET);

  const resBody: LoginResponse = {
    jwt: token,
    user: SanitizedUser.parse(user),
  };
  return Response.json(resBody);
};
