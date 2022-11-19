import { z } from "zod";

export const User = z.object({
  uuid: z.string().uuid(),
  fullname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export type User = z.infer<typeof User>;

export const SanitizedUser = User.omit({ password: true });

export type SanitizedUser = z.infer<typeof SanitizedUser>;
