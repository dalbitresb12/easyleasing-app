import { z } from "zod";

export const DateWithParsing = z.preprocess(arg => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());
export type DateWithParsing = z.infer<typeof DateWithParsing>;

export const User = z.object({
  uuid: z.string().uuid(),
  fullName: z.string().min(1, "Requerido"),
  preferredName: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(72, "La contraseña debe tener máximo 72 caracteres"),
  createdAt: DateWithParsing,
  updatedAt: DateWithParsing,
  profilePicture: z.string().uuid().optional(),
  verificationCode: z.string().optional(),
  verified: z.boolean().default(false),
  currency: z.string().length(3, "Debe ser un código ISO 4217 válido").default("PEN"),
  interest_rate_type: z.enum(["nominal", "effective"]).default("nominal"),
  language: z.string().length(2, "Debe ser un código ISO 639-1 válido").default("es"),
  timezone: z.string().default("America/Lima"),
  dateFormat: z.string().default("DD/MM/YYYY"),
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
  dateFormat: true,
}).partial();
export type UpdatableUser = z.infer<typeof UpdatableUser>;
