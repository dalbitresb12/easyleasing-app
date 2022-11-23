import { effectiveRateToEffectiveRate, nominalRateToEffectiveRate } from "./rate-conversion.mjs";
import { roundMoney, IGV } from "./utils.mjs";

export const getInitialFee = (initialFeePercentage, sellingPrice) => {
  return (initialFeePercentage / 100) * sellingPrice;
};
export const getNewSellingPrice = (oldSellingPrice, initialFee) => {
  return oldSellingPrice - initialFee;
};

export const getIgvFee = sellingPrice => {
  return roundMoney((sellingPrice * IGV) / (1 + IGV));
};

export const getSellingValue = (sellingPrice, igvFee) => {
  return sellingPrice - igvFee;
};

export const getBuyingOptionFee = (buyingOption, buyingOptionPercentage, sellingValue) => {
  if (buyingOption === true) {
    return -(buyingOptionPercentage / 100) * sellingValue;
  }
  return 0;
};

export const getAnnualPayments = paymentFrequency => {
  return 360 / paymentFrequency;
};
export const getPeriods = (loanTime, paymentFrequency) => {
  return (loanTime * 360) / paymentFrequency;
};

export const getInitialCosts = (inputs, extraCosts) => {
  let initialCosts = 0;
  for (const extraCost of extraCosts) {
    if (extraCost.type === "Inicial" && extraCost.valueType === "Monetario") {
      initialCosts += extraCost.value;
    } else if (extraCost.type === "Inicial" && extraCost.valueType === "Porcentual") {
      initialCosts += (extraCost.value / 100) * inputs.sellingPrice;
    }
  }

  return initialCosts;
};

export const getPeriodicalCosts = extraCosts => {
  let periodicalCosts = 0;
  for (const extraCost of extraCosts) {
    if (extraCost.type === "Periódico" && extraCost.valueType === "Monetario") {
      periodicalCosts -= extraCost.value;
    }
  }

  return periodicalCosts;
};

export const getInsuranceAmount = (extraCosts, sellingPrice, annualPayments) => {
  let insuranceAmount = 0;
  for (const extraCost of extraCosts) {
    if (extraCost.type === "Periódico" && extraCost.valueType === "Porcentual") {
      insuranceAmount = -(((extraCost.value / 100) * sellingPrice) / annualPayments);
    }
  }
  return insuranceAmount;
};

export const getDeprecitaion = (sellingValue, periods) => {
  return -(sellingValue / periods);
};

export const getLeasingAmount = (initialCosts, sellingValue) => {
  return initialCosts + sellingValue;
};

export const getInterestRatePerPeriod = answers => {
  if (answers.interestRateType === "Nominal") {
    return nominalRateToEffectiveRate(
      answers.interestRate,
      answers.interestRateFrequency / answers.capitalizacion,
      answers.paymentFrequency / answers.capitalizacion,
    );
  }
  return effectiveRateToEffectiveRate(answers.interestRate, answers.interestRateFrequency, answers.paymentFrequency);
};
