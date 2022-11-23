// This is a port in TypeScript of the original implementation made by @amenes12 in JavaScript.
// All the changes were done on #4, which merged the CLI and JS-based version of this.
import { irr } from "financial";

import { Currencies, InterestRateTypes, TimeFrequencies } from "@/shared/models/common";

const locales = ["es-PE", "en-US"];

export const createCurrencyFormatter = (currency: Currencies) => {
  return Intl.NumberFormat(locales, {
    style: "currency",
    currency: currency,
  });
};

export const percentFormatter = Intl.NumberFormat(locales, {
  style: "percent",
  minimumFractionDigits: 7,
});

const IGV = 0.18;

export const roundMoney = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
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

export const effectiveToEffectiveRate = (rate: number, prev: number, next: number): number => {
  return Math.pow(1 + rate / 100, prev / next) - 1;
};

export const nominalToEffectiveRate = (rate: number, m: number, n: number): number => {
  return Math.pow(1 + rate / 100 / m, n) - 1;
};

export const getInitialFee = (percent: number, price: number): number => {
  return percent * price;
};

export const getBuyingOptionFee = (percent: number, price: number): number => {
  return (percent / 100) * price;
};

export const getIgvFee = (price: number) => {
  return roundMoney((price * IGV) / (1 + IGV));
};

export const getPeriodCount = (loanTime: number, paymentFrequency: TimeFrequencies | number): number => {
  paymentFrequency = assertFrequencyToDays(paymentFrequency);
  return (loanTime * 360) / paymentFrequency;
};

export const getInterestRatePerPeriod = (
  type: InterestRateTypes,
  rate: number,
  frequency: TimeFrequencies | number,
  paymentFrequency: TimeFrequencies | number,
  capitalizationFrequency: TimeFrequencies | number,
): number => {
  frequency = assertFrequencyToDays(frequency);
  paymentFrequency = assertFrequencyToDays(paymentFrequency);
  capitalizationFrequency = assertFrequencyToDays(capitalizationFrequency);
  if (type === "nominal") {
    const m = frequency / capitalizationFrequency;
    const n = paymentFrequency / capitalizationFrequency;
    return nominalToEffectiveRate(rate, m, n);
  }
  return effectiveToEffectiveRate(rate, frequency, paymentFrequency);
};

export const calculateIrr = (values: number[]): number => {
  return irr(values, 0.01);
};

export const calculateTcea = (irr: number, installments: number): number => {
  return Math.pow(1 + irr, installments) - 1;
};
