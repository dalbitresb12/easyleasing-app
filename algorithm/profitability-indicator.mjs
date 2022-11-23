import { irr } from "financial";

export const vnaCalculation = (cashFlows, rate) => {
  let vna = 0;

  for (let iterator = 0; iterator < cashFlows.length; iterator++) {
    vna += cashFlows[iterator] / Math.pow(1 + rate, iterator);
  }

  return vna;
};

export const tirCalculation = cashFlows => {
  return irr(cashFlows, 0.01);
};
export const tceaCalculation = (tir, annualPayments) => {
  return Math.pow(1 + tir, annualPayments) - 1;
};
