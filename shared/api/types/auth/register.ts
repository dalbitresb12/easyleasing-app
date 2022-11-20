import { z } from "zod";

import { User } from "@/shared/models/user";

export const RegisterRequest = User.pick({ fullName: true, preferredName: true, email: true, password: true });
export type RegisterRequest = z.infer<typeof RegisterRequest>;
