import * as bcrypt from "bcryptjs";
import { SanitizedUser, User } from "../../models/user";
import type { AppFunction } from "../../types/appcontext";
import { ServerError } from "../../types/httperror";
import { parseBody } from "../../utils/bodyparser";
import { sendConfirmationEmail } from "../../utils/postmark";

export const onRequestGet: AppFunction = ctx => Response.json(SanitizedUser.parse(ctx.data.user));

const UpdatableUser = User.pick({ email: true, fullName: true, password: true }).partial();

export const onRequestPatch: AppFunction = async ctx => {
  const patch = await parseBody(ctx.request, UpdatableUser);

  const previousEmail = ctx.data.user.email;

  // Merge properties
  const merged = { ...ctx.data.user, ...patch };

  // Send confirmation email if email changes
  if (patch.email) {
    // TODO: Send email to previous email notifying change
    const emailResponse = await sendConfirmationEmail(ctx, merged);
    if (!emailResponse.success) {
      throw new ServerError(
        "An internal error occurred while trying to send the confirmation email.",
        emailResponse.raw,
      );
    }
    merged.verified = false;
  }

  // Hash new password and update
  if (patch.password) {
    const salt = await bcrypt.genSalt(10);
    merged.password = await bcrypt.hash(merged.password, salt);
  }

  // Update context
  ctx.data.user = merged;

  // Save on KV
  await ctx.env.users.put(ctx.data.user.email, JSON.stringify(ctx.data.user));
  if (patch.email) {
    await ctx.env.users.delete(previousEmail);
  }

  // Sanitize and return
  const sanitized = SanitizedUser.parse(ctx.data.user);
  return Response.json(sanitized);
};
