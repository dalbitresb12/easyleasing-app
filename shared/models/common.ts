import { z } from "zod";

export const DateWithParsing = z.preprocess(arg => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());
export type DateWithParsing = z.infer<typeof DateWithParsing>;

export const Currencies = z.enum(["PEN", "USD"]);
export type Currencies = z.infer<typeof Currencies>;
export const CurrenciesValues = Object.values(Currencies.Values);

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
export const TimeFrequenciesValues = Object.values(TimeFrequencies.Values);

export const InterestRateTypes = z.enum(["nominal", "effective"]);
export type InterestRateTypes = z.infer<typeof InterestRateTypes>;
export const InterestRateTypesValues = Object.values(InterestRateTypes.Values);

export const NumericalType = z.enum(["number", "percent"]);
export type NumericalType = z.infer<typeof NumericalType>;
export const NumericalTypeValues = Object.values(NumericalType.Values);

export const ExpenseType = z.enum(["one-time", "recurrent"]);
export type ExpenseType = z.infer<typeof ExpenseType>;
export const ExpenseTypeValues = Object.values(ExpenseType.Values);
