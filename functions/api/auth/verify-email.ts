import { VerifyEmailRequest, SuccessResponse } from "@/shared/api/types";
import { User } from "@/shared/models/user";
import type { AppFunction } from "../../types/appcontext";
import { HttpError } from "../../types/httperror";
import { parseBody } from "../../utils/bodyparser";

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, VerifyEmailRequest);

  // Find the requested user
  const data = await ctx.env.users.get(req.email);
  if (!data) {
    throw new HttpError(400, "Invalid email or verification code.");
  }
  const user = User.parse(JSON.parse(data));

  // Check if user is already verified
  if (user.verified) {
    throw new HttpError(400, "Invalid email or verification code.");
  }

  // Check if code matches
  if (user.verificationCode !== req.code) {
    throw new HttpError(400, "Invalid email or verification code.");
  }

  // Update user status in KV
  user.verified = true;
  delete user.verificationCode;
  await ctx.env.users.put(user.email, JSON.stringify(user));

  const resBody: SuccessResponse = { success: true };
  return Response.json(resBody);
};
