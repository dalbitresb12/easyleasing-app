import type { GracePeriod } from "./models/grace-period";
import type { Payment } from "./models/payment";
import { IR, IGV } from "./peruvian-taxes";

const getInterest = (initialBalance: number, interestRate: number): number => {
  return -(initialBalance * interestRate);
};

const frenchFeeCalculation = (
  gracePeriod: GracePeriod,
  initialBalance: number,
  rate: number,
  periods: number,
  currentPeriod: number,
): number => {
  if (gracePeriod === "partial") {
    return getInterest(initialBalance, rate);
  } else if (gracePeriod === "no") {
    return -(
      (Math.pow(1 + rate, periods - currentPeriod + 1) * initialBalance * rate) /
      (Math.pow(1 + rate, periods - currentPeriod + 1) - 1)
    );
  }
  return 0;
};

const getAmortization = (gracePeriod: GracePeriod, fee: number, interest: number): number => {
  if (gracePeriod === "no") {
    return fee - interest;
  }
  return 0;
};

const getFinalBalance = (
  gracePeriod: GracePeriod,
  initialBalance: number,
  interest: number,
  amortization: number,
): number => {
  if (gracePeriod === "total") {
    return initialBalance - interest;
  } else if (gracePeriod === "partial") {
    return initialBalance;
  }
  return initialBalance + amortization;
};

const getTaxSavings = (interest: number, periodicalCosts: number, depreciation: number): number => {
  return (interest + periodicalCosts + depreciation) * IR;
};

const getPeriodicalTaxes = (fee: number, periodicalCosts: number, buyingOptionFee: number): number => {
  return (fee + periodicalCosts + buyingOptionFee) * IGV;
};

const getGrossFlow = (fee: number, periodicalCosts: number, buyingOptionFee: number): number => {
  return fee + periodicalCosts + buyingOptionFee;
};

const getNetFlow = (grossFlow: number, taxSavings: number): number => {
  return grossFlow - taxSavings;
};

const getFlowWithTaxes = (grossFlow: number, periodicalTaxes: number): number => {
  return grossFlow + periodicalTaxes;
};

export const generatePaymentSchedule = (
  gracePeriods: GracePeriod[],
  periods: number,
  interesRatePerPeriod: number,
  sellingValue: number,
  initialCosts: number,
  periodicalCosts: number,
  depreciation: number,
  buyingOptionFee: number,
): Payment[] => {
  const leasingAmount = sellingValue + initialCosts;
  let initialBalance = leasingAmount;
  const paymentSchedule = [] as Payment[];

  for (let currentPeriod = 1; currentPeriod <= periods; currentPeriod++) {
    const currentGracePeriod = gracePeriods[currentPeriod - 1];

    const interest = getInterest(initialBalance, interesRatePerPeriod);

    const fee = frenchFeeCalculation(currentGracePeriod, initialBalance, interesRatePerPeriod, periods, currentPeriod);
    const amortization = getAmortization(currentGracePeriod, fee, interest);
    const finalBalance = getFinalBalance(currentGracePeriod, initialBalance, interest, amortization);

    const taxSavings = getTaxSavings(interest, periodicalCosts, depreciation);
    const periodicalTaxes = getPeriodicalTaxes(fee, periodicalCosts, currentPeriod === periods ? buyingOptionFee : 0);
    const grossFlow = getGrossFlow(fee, periodicalCosts, currentPeriod === periods ? buyingOptionFee : 0);

    const flowWithTaxes = getFlowWithTaxes(grossFlow, periodicalTaxes);
    const netFlow = getNetFlow(grossFlow, taxSavings);

    paymentSchedule.push({
      period: currentPeriod,
      gracePeriod: currentGracePeriod,
      initialBalance: initialBalance,
      interest: interest,
      fee: fee,
      amortization: amortization,
      periodicalCosts: periodicalCosts,
      buyingOptionFee: currentPeriod === periods ? buyingOptionFee : 0,
      finalBalance: finalBalance,
      depreciation: depreciation,
      taxSavings: taxSavings,
      IGV: periodicalTaxes,
      grossFlow: grossFlow,
      flowWithTaxes: flowWithTaxes,
      netFlow: netFlow,
    });

    initialBalance = finalBalance;
  }

  return paymentSchedule;
};
