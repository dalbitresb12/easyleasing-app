import { z } from "zod";
import { User } from "../../models/user";
import type { AppFunction } from "../../types/appcontext";
import { HttpError, ValidationError } from "../../types/httperror";

export const VerifyEmailRequest = z.object({
  email: z.string().email(),
  code: z.string(),
});
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequest>;

export type VerifyEmailResponse = {
  success: boolean;
};

export const onRequestPost: AppFunction = async ctx => {
  const reqBody = await ctx.request.json();

  // Validate request body
  const parsed = VerifyEmailRequest.safeParse(reqBody);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  const { data: req } = parsed;

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

  const resBody: VerifyEmailResponse = { success: true };
  return Response.json(resBody);
};
