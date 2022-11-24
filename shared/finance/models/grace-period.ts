import { z } from "zod";

export const GracePeriod = z.enum(["total", "partial", "no"]);
export type GracePeriod = z.infer<typeof GracePeriod>;

const gradePeriodMapping: Record<GracePeriod, string> = {
  total: "Total",
  partial: "Parcial",
  no: "Sin plazo de gracia",
};

export const gracePeriodToString = (gracePeriod: GracePeriod) => gradePeriodMapping[gracePeriod];
