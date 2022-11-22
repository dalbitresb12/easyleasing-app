import { z } from "zod";

export const DateWithParsing = z.preprocess(arg => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());
export type DateWithParsing = z.infer<typeof DateWithParsing>;

export const TimeFrequencies = z.enum([
  "daily",
  "biweekly",
  "monthly",
  "bimonthly",
  "quarterly",
  "four-monthly",
  "semi-annually",
  "annually",
]);
export type TimeFrequencies = z.infer<typeof TimeFrequencies>;

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
  lastPasswordUpdate: DateWithParsing,
  profilePicture: z.string().uuid().optional(),
  verificationCode: z.string().optional(),
  verified: z.boolean().default(false),
  currency: z.enum(["PEN", "USD"]).default("PEN"),
  paymentFrequency: TimeFrequencies.default("monthly"),
  interestRateType: z.enum(["nominal", "effective"]).default("nominal"),
  capitalizationType: TimeFrequencies.default("monthly"),
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
  paymentFrequency: true,
  interestRateType: true,
  capitalizationType: true,
  language: true,
  timezone: true,
  dateFormat: true,
}).partial();
export type UpdatableUser = z.infer<typeof UpdatableUser>;
