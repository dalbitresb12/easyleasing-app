import { LeasingResult } from "./models/leasing-result";
import { Payment } from "./models/payment";

export const getLeasingResults = (paymentSchedule: Payment[], buyingOptionFee: number): LeasingResult => {
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
    totalInterest: totalInterest,
    totalAmortization: totalAmortization,
    totalInsurance: totalInsurance,
    totalPeriodicalCosts: totalPeriodicalCosts,
    totalPayment: totalPayment,
  };
};

export const getGrossFlows = (leasingAmount: number, paymentSchedule: Payment[]): number[] => {
  const grossFlows = [leasingAmount];
  for (const payment of paymentSchedule) {
    grossFlows.push(payment.grossFlow);
  }

  return grossFlows;
};

export const getNetFlows = (leasingAmount: number, paymentSchedule: Payment[]): number[] => {
  const netFlows = [leasingAmount];
  for (const payment of paymentSchedule) {
    netFlows.push(payment.netFlow);
  }

  return netFlows;
};
