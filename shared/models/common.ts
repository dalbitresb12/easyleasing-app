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
const timeFrequenciesLocalization: Record<TimeFrequencies, string> = {
  daily: "diaria",
  biweekly: "quincenal",
  monthly: "mensual",
  bimonthly: "bimestral",
  quarterly: "trimestral",
  "four-monthly": "cuatrimestral",
  "semi-annually": "semestral",
  annually: "anual",
};
export const localizeTimeFrequency = (value: TimeFrequencies): string => {
  return timeFrequenciesLocalization[value];
};
const frequenciesMap: Record<TimeFrequencies, number> = {
  daily: 1,
  biweekly: 15,
  monthly: 30,
  bimonthly: 60,
  quarterly: 90,
  "four-monthly": 120,
  "semi-annually": 180,
  annually: 360,
};
export const frequencyToDays = (frequency: TimeFrequencies): number => {
  return frequenciesMap[frequency];
};
export const assertFrequencyToDays = (frequency: TimeFrequencies | number): number => {
  if (typeof frequency === "string") return frequencyToDays(frequency);
  return frequency;
};

export const InterestRateTypes = z.enum(["nominal", "effective"]);
export type InterestRateTypes = z.infer<typeof InterestRateTypes>;
export const InterestRateTypesValues = Object.values(InterestRateTypes.Values);
const interestRateTypeLocalization: Record<InterestRateTypes, string> = {
  nominal: "nominal",
  effective: "efectiva",
};
export const localizeInterestRateType = (value: InterestRateTypes): string => {
  return interestRateTypeLocalization[value];
};

export const NumericalType = z.enum(["number", "percent"]);
export type NumericalType = z.infer<typeof NumericalType>;
export const NumericalTypeValues = Object.values(NumericalType.Values);
const numericalTypeLocalization: Record<NumericalType, string> = {
  number: "monetario",
  percent: "porcentual",
};
export const localizeNumericalType = (value: NumericalType): string => {
  return numericalTypeLocalization[value];
};

export const ExpenseType = z.enum(["one-time", "recurrent"]);
export type ExpenseType = z.infer<typeof ExpenseType>;
export const ExpenseTypeValues = Object.values(ExpenseType.Values);
const expenseTypeLocalization: Record<ExpenseType, string> = {
  "one-time": "inicial",
  recurrent: "periódico",
};
export const localizeExpenseType = (value: ExpenseType): string => {
  return expenseTypeLocalization[value];
};

export const GracePeriod = z.enum(["total", "partial", "no"]);
export type GracePeriod = z.infer<typeof GracePeriod>;
const gradePeriodLocalization: Record<GracePeriod, string> = {
  total: "Total",
  partial: "Parcial",
  no: "Sin plazo de gracia",
};

export const localizeGracePeriod = (gracePeriod: GracePeriod) => {
  return gradePeriodLocalization[gracePeriod];
};
