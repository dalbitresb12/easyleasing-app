import { assertFrequencyToDays, InterestRateTypes, TimeFrequencies } from "../models/common";
import { LeasingExtras } from "../models/leasing";
import { IGV } from "./peruvian-taxes";
import { effectiveToEffectiveRate, nominalRateToEffectiveRate } from "./rate-conversion";

export const getInitialFee = (initialFeePercentage: number, sellingPrice: number): number => {
  return (initialFeePercentage / 100) * sellingPrice;
};

export const getNewSellingPrice = (oldSellingPrice: number, initialFee: number): number => {
  return oldSellingPrice - initialFee;
};

export const getIgvFee = (sellingPrice: number): number => {
  return (sellingPrice * IGV) / (1 + IGV);
};

export const getSellingValue = (sellingPrice: number, igvFee: number): number => {
  return sellingPrice - igvFee;
};

export const getBuyingOptionFee = (
  buyingOption: boolean,
  buyingOptionPercentage: number,
  sellingValue: number,
): number => {
  if (buyingOption === true) {
    return -(buyingOptionPercentage / 100) * sellingValue;
  }
  return 0;
};

export const getAnnualPayments = (paymentFrequency: TimeFrequencies | number) => {
  paymentFrequency = assertFrequencyToDays(paymentFrequency);
  return 360 / paymentFrequency;
};
export const getPeriods = (loanTime: number, paymentFrequency: TimeFrequencies | number) => {
  paymentFrequency = assertFrequencyToDays(paymentFrequency);
  return (loanTime * 360) / paymentFrequency;
};

export const getInitialCosts = (sellingPrice: number, extraCosts: LeasingExtras[]): number => {
  let initialCosts = 0;
  for (const extraCost of extraCosts) {
    if (extraCost.expenseType === "one-time" && extraCost.valueType === "number") {
      initialCosts += extraCost.value;
    } else if (extraCost.expenseType === "one-time" && extraCost.valueType === "percent") {
      initialCosts += (extraCost.value / 100) * sellingPrice;
    }
  }

  return initialCosts;
};

export const getPeriodicalCosts = (
  extraCosts: LeasingExtras[],
  sellingPrice: number,
  annualPayments: number,
): number => {
  let periodicalCosts = 0;
  for (const extraCost of extraCosts) {
    if (extraCost.expenseType === "recurrent" && extraCost.valueType === "number") {
      periodicalCosts -= extraCost.value;
    } else if (extraCost.expenseType === "recurrent" && extraCost.valueType === "percent") {
      periodicalCosts -= ((extraCost.value / 100) * sellingPrice) / annualPayments;
    }
  }

  return periodicalCosts;
};

export const getDepreciation = (sellingValue: number, periods: number): number => {
  return -(sellingValue / periods);
};

export const getLeasingAmount = (initialCosts: number, sellingValue: number): number => {
  return initialCosts + sellingValue;
};

export const getInterestRatePerPeriod = (
  type: InterestRateTypes,
  rate: number,
  frequency: TimeFrequencies | number,
  paymentFrequency: TimeFrequencies | number,
  capitalization?: TimeFrequencies | number,
): number => {
  frequency = assertFrequencyToDays(frequency);
  paymentFrequency = assertFrequencyToDays(paymentFrequency);
  capitalization = capitalization ? assertFrequencyToDays(capitalization) : undefined;
  if (type === "nominal") {
    if (!capitalization) throw new Error("Capitalization is required when `type` is set to `nominal`.");
    const m = frequency / capitalization;
    const n = frequency / capitalization;
    return nominalRateToEffectiveRate(rate, m, n);
  }
  return effectiveToEffectiveRate(rate, frequency, paymentFrequency);
};

export const getExtraValueByPercentage = (percent: number, price: number): number => {
  return (percent / 100) * price;
};
