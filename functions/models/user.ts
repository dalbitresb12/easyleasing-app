import { z } from "zod";

export const User = z.object({
  uuid: z.string().uuid(),
  fullName: z.string().min(1),
  fullname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  verified: z.boolean().default(false).optional(),
  verificationCode: z.string().optional(),
});

export type User = z.infer<typeof User>;

export const SanitizedUser = User.omit({ password: true, verificationCode: true });

export type SanitizedUser = z.infer<typeof SanitizedUser>;
