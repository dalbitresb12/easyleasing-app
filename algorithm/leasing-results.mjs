import { roundMoney } from "./utils.mjs";

export const getLeasingResults = (paymentSchedule, buyingOptionFee) => {
  let totalInterest = 0;
  let totalInsurance = 0;
  let totalPeriodicalCosts = 0;
  let totalAmortization = 0;

  for (const payment of paymentSchedule) {
    totalAmortization += payment.amortization;
    if (!(payment.gracePeriod === "Total")) {
      totalInterest += payment.interest;
    }
    totalPeriodicalCosts += payment.periodicalCosts;
    totalInsurance += payment.insuranceAmount;
  }

  const totalPayment = totalInterest + totalAmortization + totalInsurance + totalPeriodicalCosts + buyingOptionFee;

  return {
    totalInterest: roundMoney(totalInterest),
    totalAmortization: roundMoney(totalAmortization),
    totalInsurance: roundMoney(totalInsurance),
    totalPeriodicalCosts: roundMoney(totalPeriodicalCosts),
    totalPayment: roundMoney(totalPayment),
  };
};

export const getGrossFlows = (leasingAmount, paymentSchedule) => {
  const grossFlows = [leasingAmount];
  for (const payment of paymentSchedule) {
    grossFlows.push(payment.grossFlow);
  }

  return grossFlows;
};

export const getNetFlows = (leasingAmount, paymentSchedule) => {
  const netFlows = [leasingAmount];
  for (const payment of paymentSchedule) {
    netFlows.push(payment.netFlow);
  }

  return netFlows;
};
