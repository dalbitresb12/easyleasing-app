import { z } from "zod";

export const DateWithParsing = z.preprocess(arg => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());
export type DateWithParsing = z.infer<typeof DateWithParsing>;

export const Currencies = z.enum(["PEN", "USD"]);
export type Currencies = z.infer<typeof Currencies>;

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

export const InterestRateTypes = z.enum(["nominal", "effective"]);
export type InterestRateTypes = z.infer<typeof InterestRateTypes>;
