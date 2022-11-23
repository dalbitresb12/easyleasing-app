import { Payment } from "./models/payment";
import { IR, IGV } from "./peruvian-taxes";

const getInterest = (initialBalance: number, interestRate: number): number => {
  return -(initialBalance * interestRate);
};

const frenchFeeCalculation = (
  gracePeriod: string,
  initialBalance: number,
  rate: number,
  periods: number,
  currentPeriod: number,
): number => {
  if (gracePeriod === "Parcial") {
    return getInterest(initialBalance, rate);
  } else if (gracePeriod === "Sin plazo de gracia") {
    return -(
      (Math.pow(1 + rate, periods - currentPeriod + 1) * initialBalance * rate) /
      (Math.pow(1 + rate, periods - currentPeriod + 1) - 1)
    );
  }
  return 0;
};

const getAmortization = (gracePeriod: string, fee: number, interest: number): number => {
  if (gracePeriod === "Sin plazo de gracia") {
    return fee - interest;
  }
  return 0;
};

const getFinalBalance = (
  gracePeriod: string,
  initialBalance: number,
  interest: number,
  amortization: number,
): number => {
  if (gracePeriod === "Total") {
    return initialBalance - interest;
  } else if (gracePeriod === "Parcial") {
    return initialBalance;
  }
  return initialBalance + amortization;
};

const getTaxSavings = (interest: number, insurance: number, periodicalCosts: number, depreciation: number): number => {
  return (interest + insurance + periodicalCosts + depreciation) * IR;
};

const getPeriodicalTaxes = (
  fee: number,
  insurance: number,
  periodicalCosts: number,
  buyingOptionFee: number,
): number => {
  return (fee + insurance + periodicalCosts + buyingOptionFee) * IGV;
};

const getGrossFlow = (fee: number, insurance: number, periodicalCosts: number, buyingOptionFee: number): number => {
  return fee + insurance + periodicalCosts + buyingOptionFee;
};

const getNetFlow = (grossFlow: number, taxSavings: number): number => {
  return grossFlow - taxSavings;
};

const getFlowWithTaxes = (grossFlow: number, periodicalTaxes: number): number => {
  return grossFlow + periodicalTaxes;
};

export const generatePaymentSchedule = (
  gracePeriods: string[],
  periods: number,
  interesRatePerPeriod: number,
  sellingValue: number,
  initialCosts: number,
  periodicalCosts: number,
  insuranceAmount: number,
  depreciation: number,
  buyingOptionFee: number,
): Payment[] => {
  const leasingAmount = sellingValue + initialCosts;
  let initialBalance = leasingAmount;
  let currentGracePeriod = "";
  let fee = 0;
  let interest = 0;
  let amortization = 0;
  let finalBalance = 0;
  let taxSavings = 0;
  let periodicalTaxes = 0;
  let grossFlow = 0;
  let flowWithTaxes = 0;
  let netFlow = 0;
  const paymentSchedule = [] as Payment[];

  for (let currentPeriod = 1; currentPeriod <= periods; currentPeriod++) {
    currentGracePeriod = gracePeriods[currentPeriod - 1];

    interest = getInterest(initialBalance, interesRatePerPeriod);

    fee = frenchFeeCalculation(currentGracePeriod, initialBalance, interesRatePerPeriod, periods, currentPeriod);
    amortization = getAmortization(currentGracePeriod, fee, interest);
    finalBalance = getFinalBalance(currentGracePeriod, initialBalance, interest, amortization);

    taxSavings = getTaxSavings(interest, insuranceAmount, periodicalCosts, depreciation);
    periodicalTaxes = getPeriodicalTaxes(
      fee,
      insuranceAmount,
      periodicalCosts,
      currentPeriod === periods ? buyingOptionFee : 0,
    );
    grossFlow = getGrossFlow(fee, insuranceAmount, periodicalCosts, currentPeriod === periods ? buyingOptionFee : 0);

    flowWithTaxes = getFlowWithTaxes(grossFlow, periodicalTaxes);
    netFlow = getNetFlow(grossFlow, taxSavings);

    paymentSchedule.push({
      period: currentPeriod,
      gracePeriod: currentGracePeriod,
      initialBalance: initialBalance,
      interest: interest,
      fee: fee,
      amortization: amortization,
      insuranceAmount: insuranceAmount,
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
