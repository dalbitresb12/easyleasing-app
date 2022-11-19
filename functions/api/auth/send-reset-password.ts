import { z } from "zod";
import { User } from "../../models/user";
import type { AppFunction } from "../../types/appcontext";
import { HttpError, ServerError } from "../../types/httperror";
import { parseBody } from "../../utils/bodyparser";
import { sendResetPasswordEmail } from "../../utils/postmark";

export const SendResetPasswordRequest = z.object({
  email: z.string().email(),
});
export type SendResetPasswordRequest = z.infer<typeof SendResetPasswordRequest>;

export type SendResetPasswordResponse = {
  success: boolean;
};

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, SendResetPasswordRequest);

  // Find the requested user
  const data = await ctx.env.users.get(req.email);
  if (!data) {
    throw new HttpError(400, "Invalid email.");
  }
  const user = User.parse(JSON.parse(data));

  // Send confirmation email
  const emailResponse = await sendResetPasswordEmail(ctx, user);
  if (!emailResponse.success) {
    throw new ServerError(
      "An internal error occurred while trying to send the reset password email.",
      emailResponse.raw,
    );
  }

  // Save to KV
  await ctx.env.users.put(req.email, JSON.stringify(user));

  const resBody: SendResetPasswordResponse = { success: true };
  return Response.json(resBody);
};
