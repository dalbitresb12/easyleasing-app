import { HttpError, SendResetPasswordRequest, ServerError, SuccessResponse } from "@/shared/api/types";
import { User } from "@/shared/models/user";

import type { AppFunction } from "../../types/appcontext";
import { parseBody } from "../../utils/model-parser";
import { sendResetPasswordEmail } from "../../utils/postmark";

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

  const resBody: SuccessResponse = { success: true };
  return Response.json(resBody);
};
