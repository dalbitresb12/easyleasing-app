import { LeasingResult } from "./models/leasing-result";
import { Payment } from "./models/payment";

export const getLeasingResults = (paymentSchedule: Payment[], buyingOptionFee: number): LeasingResult => {
  let totalInterest = 0;
  let totalPeriodicalCosts = 0;
  let totalAmortization = 0;

  for (const payment of paymentSchedule) {
    totalAmortization += payment.amortization;
    if (!(payment.gracePeriod === "total")) {
      totalInterest += payment.interest;
    }
    totalPeriodicalCosts += payment.periodicalCosts;
  }

  const totalPayment = totalInterest + totalAmortization + totalPeriodicalCosts + buyingOptionFee;

  return {
    totalInterest: totalInterest,
    totalAmortization: totalAmortization,
    totalPeriodicalCosts: totalPeriodicalCosts,
    totalPayment: totalPayment,
  };
};

export const getGrossFlows = (leasingAmount: number, paymentSchedule: Payment[]): number[] => {
  return [leasingAmount, ...paymentSchedule.map(item => item.grossFlow)];
};

export const getNetFlows = (leasingAmount: number, paymentSchedule: Payment[]): number[] => {
  return [leasingAmount, ...paymentSchedule.map(item => item.netFlow)];
};
