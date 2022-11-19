import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { User } from "../../models/user";
import type { AppFunction } from "../../types/appcontext";
import { HttpError, ServerError } from "../../types/httperror";
import { parseBody } from "../../utils/bodyparser";
import { sendConfirmationEmail } from "../../utils/postmark";

export const RegisterRequest = User.pick({ fullname: true, email: true, password: true });
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export type RegisterResponse = {
  success: boolean;
};

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

  const user: User = {
    ...req,
    uuid: uuid,
    password: hashedPassword,
    verified: false,
  };

  // Send confirmation email
  const emailResponse = await sendConfirmationEmail(ctx, user);
  if (!emailResponse.success) {
    throw new ServerError("An internal error occurred while trying to send the confirmation email.", emailResponse.raw);
  }

  // Save to KV
  await ctx.env.users.put(req.email, JSON.stringify(user));

  const resBody: RegisterResponse = { success: true };
  return Response.json(resBody);
};
