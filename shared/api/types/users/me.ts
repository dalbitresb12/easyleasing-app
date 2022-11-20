import { z } from "zod";

import { User } from "@/shared/models/user";

export const UpdatableUser = User.pick({
  fullName: true,
  preferredName: true,
  email: true,
  password: true,
  currency: true,
  interest_rate_type: true,
  language: true,
  timezone: true,
}).partial();
export type UpdatableUser = z.infer<typeof UpdatableUser>;
