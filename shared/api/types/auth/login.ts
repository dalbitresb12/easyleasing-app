import { z } from "zod";
import type { JwtPayload as BaseJwtPayload } from "@tsndr/cloudflare-worker-jwt";

import { SanitizedUser, User } from "@/shared/models/user";

export const LoginRequest = User.pick({ email: true, password: true });
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  jwt: z.string(),
  user: SanitizedUser,
});
export type LoginResponse = z.infer<typeof LoginResponse>;

export interface JwtPayload extends BaseJwtPayload {
  name: string;
  email: string;
}
