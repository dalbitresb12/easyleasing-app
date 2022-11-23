import { roundMoney, IGV, IR } from "./utils.mjs";

const getInterest = (initialBalance, interestRate) => {
  return -(initialBalance * interestRate);
};

function frenchFeeCalculation(gracePeriod, initialBalance, interestRate, periods, currentPeriod) {
  if (gracePeriod === "Parcial") {
    return getInterest(initialBalance, interestRate);
  } else if (gracePeriod === "Sin plazo de gracia") {
    return -(
      (Math.pow(1 + interestRate, periods - currentPeriod + 1) * initialBalance * interestRate) /
      (Math.pow(1 + interestRate, periods - currentPeriod + 1) - 1)
    );
  }
  return 0;
}

function getAmortization(gracePeriod, fee, interest) {
  if (gracePeriod === "Sin plazo de gracia") {
    return fee - interest;
  }
  return 0;
}

function getFinalBalance(gracePeriod, initialBalance, interest, amortization) {
  if (gracePeriod === "Total") {
    return initialBalance - interest;
  } else if (gracePeriod === "Parcial") {
    return initialBalance;
  }
  return initialBalance + amortization;
}

function getTaxSavings(interest, insurance, periodicalCosts, depreciation) {
  return (interest + insurance + periodicalCosts + depreciation) * IR;
}

function getPeriodicalTaxes(fee, insurance, periodicalCosts, buyingOptionFee) {
  return (fee + insurance + periodicalCosts + buyingOptionFee) * IGV;
}

function getGrossFlow(fee, insurance, periodicalCosts, buyingOptionFee) {
  return fee + insurance + periodicalCosts + buyingOptionFee;
}

function getNetFlow(grossFlow, taxSavings) {
  return grossFlow - taxSavings;
}

function getFlowWithTaxes(grossFlow, periodicalTaxes) {
  return grossFlow + periodicalTaxes;
}

export const generatePaymentSchedule = (
  gracePeriods,
  periods,
  interesRatePerPeriod,
  sellingValue,
  initialCosts,
  periodicalCosts,
  insuranceAmount,
  depreciation,
  buyingOptionFee,
) => {
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

  const paymentSchedule = [];

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
      initialBalance: roundMoney(initialBalance),
      interest: roundMoney(interest),
      fee: roundMoney(fee),
      amortization: roundMoney(amortization),
      insuranceAmount: roundMoney(insuranceAmount),
      periodicalCosts: roundMoney(periodicalCosts),
      buyingOptionFee: currentPeriod === periods ? roundMoney(buyingOptionFee) : 0,
      finalBalance: roundMoney(finalBalance),
      depreciation: roundMoney(depreciation),
      taxSavings: roundMoney(taxSavings),
      IGV: roundMoney(periodicalTaxes),
      grossFlow: roundMoney(grossFlow),
      flowWithTaxes: roundMoney(flowWithTaxes),
      netFlow: roundMoney(netFlow),
    });

    initialBalance = finalBalance;
  }

  return paymentSchedule;
};
