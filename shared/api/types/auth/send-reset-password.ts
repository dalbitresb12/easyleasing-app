import { z } from "zod";

import { User } from "@/shared/models/user";

export const SendResetPasswordRequest = z.object({
  email: User.shape.email,
});
export type SendResetPasswordRequest = z.infer<typeof SendResetPasswordRequest>;
