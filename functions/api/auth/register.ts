import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { HttpError, RegisterRequest, ServerError, SuccessResponse } from "@/shared/api/types";
import { User } from "@/shared/models/user";
import type { AppFunction } from "../../types/appcontext";
import { parseBody } from "../../utils/bodyparser";
import { sendConfirmationEmail } from "../../utils/postmark";

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, RegisterRequest);

  // Check for duplicates
  const duplicateUser = await ctx.env.users.get(req.email);
  if (duplicateUser) {
    throw new HttpError(400, "Another user already exists with that email.");
  }

  // Generate unique ID
  const uuid = uuidv4();

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.password, salt);

  const user = User.parse({
    ...req,
    uuid: uuid,
    password: hashedPassword,
    verified: false,
  });

  // Send confirmation email
  const emailResponse = await sendConfirmationEmail(ctx, user);
  if (!emailResponse.success) {
    throw new ServerError("An internal error occurred while trying to send the confirmation email.", emailResponse.raw);
  }

  // Save to KV
  await ctx.env.users.put(req.email, JSON.stringify(user));

  const resBody: SuccessResponse = { success: true };
  return Response.json(resBody);
};
