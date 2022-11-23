import * as bcrypt from "bcryptjs";

import { HttpError, ResetPasswordRequest, SuccessResponse } from "@/shared/api/types";
import { User } from "@/shared/models/user";

import type { AppFunction } from "../../types/appcontext";
import { parseBody } from "../../utils/model-parser";

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, ResetPasswordRequest);

  // Find the requested user
  const data = await ctx.env.users.get(req.email);
  if (!data) {
    throw new HttpError(400, "Invalid email or verification code.");
  }
  const user = User.parse(JSON.parse(data));

  // Check if code matches
  if (user.verificationCode !== req.code) {
    throw new HttpError(400, "Invalid email or verification code.");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.password, salt);

  // Update user status in KV
  user.password = hashedPassword;
  user.verified = true;
  user.lastPasswordUpdate = new Date();
  delete user.verificationCode;
  await ctx.env.users.put(user.email, JSON.stringify(user));

  const resBody: SuccessResponse = { success: true };
  return Response.json(resBody);
};
