import * as jwt from "@tsndr/cloudflare-worker-jwt";
import * as bcrypt from "bcryptjs";
import ms from "ms";
import { z } from "zod";
import { SanitizedUser, User } from "../../models/user";
import type { AppFunction } from "../../types/appcontext";
import { HttpError, ValidationError } from "../../types/httperror";

export const LoginRequest = User.pick({ email: true, password: true });
export type LoginRequest = z.infer<typeof LoginRequest>;

export type LoginResponse = {
  jwt: string;
  user: SanitizedUser;
};

export interface JwtPayload extends jwt.JwtPayload {
  name: string;
  email: string;
}

export const onRequestPost: AppFunction = async ctx => {
  // Validate request body
  const parsed = LoginRequest.safeParse(await ctx.request.json());
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  const { data: req } = parsed;

  // Get user from KV
  const data = await ctx.env.users.get(req.email);
  if (!data) {
    throw new HttpError(401, "Invalid email or password.");
  }
  const user = User.parse(JSON.parse(data));

  // Verify password
  const isValid = await bcrypt.compare(req.password, user.password);
  if (!isValid) {
    throw new HttpError(401, "Invalid email or password.");
  }

  // Generate token
  const url = new URL(ctx.request.url);
  const payload: JwtPayload = {
    sub: user.email,
    name: user.fullname,
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
