import { irr } from "financial";

export const tirCalculation = cashFlows => {
  return irr(cashFlows, 0.01);
};
export const tceaCalculation = (tir, annualPayments) => {
  return Math.pow(1 + tir, annualPayments) - 1;
};
