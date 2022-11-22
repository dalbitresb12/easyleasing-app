import { z } from "zod";

import { User } from "@/shared/models/user";

export const ResetPasswordRequest = z.object({
  email: User.shape.email,
  password: User.shape.password,
  code: z.string(),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;
