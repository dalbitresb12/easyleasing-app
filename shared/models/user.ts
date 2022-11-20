import { z } from "zod";

export const User = z.object({
  uuid: z.string().uuid(),
  fullName: z.string().min(1, "Requerido"),
  preferredName: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(72, "La contraseña debe tener máximo 72 caracteres"),
  profilePicture: z.string().uuid().optional(),
  verified: z.boolean().default(false).optional(),
  verificationCode: z.string().optional(),
  currency: z.string().length(3, "Debe ser un código ISO 4217 válido").default("PEN").optional(),
  interest_rate_type: z.enum(["nominal", "effective"]).default("nominal").optional(),
  language: z.string().length(2, "Debe ser un código ISO 639-1 válido").default("es").optional(),
  timezone: z.string().default("America/Lima").optional(),
});
export type User = z.infer<typeof User>;

export const SanitizedUser = User.omit({ password: true, verificationCode: true });
export type SanitizedUser = z.infer<typeof SanitizedUser>;

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
