import type { AppFunction } from "../../types/appcontext";
import { User } from "../../models/user";
import { v4 as uuidv4 } from "uuid";
import { HttpError, ValidationError } from "../../types/httperror";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

export const RegisterRequest = User.omit({ uuid: true });
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export type RegisterResponse = {
  success: boolean;
};

export const onRequestPost: AppFunction = async ({ request, env }) => {
  const reqBody = await request.json();

  // Validate request body
  const parsed = RegisterRequest.safeParse(reqBody);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  const { data } = parsed;

  // Check for duplicates
  const duplicateUser = await env.users.get(data.email);
  if (duplicateUser) {
    throw new HttpError(400, "Another user already exists with that email.");
  }

  // Generate unique ID
  const uuid = uuidv4();

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  // Save to KV
  const user: User = { ...data, password: hashedPassword, uuid: uuid };
  await env.users.put(data.email, JSON.stringify(user));

  const resBody: RegisterResponse = { success: true };
  return Response.json(resBody);
};
