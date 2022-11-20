import { z } from "zod";

import { User } from "@/shared/models/user";

export const VerifyEmailRequest = z.object({
  email: User.shape.email,
  code: z.string(),
});
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequest>;
