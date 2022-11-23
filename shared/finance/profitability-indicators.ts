import { irr } from "financial";

export const vnaCalculation = (cashFlows: number[], rate: number): number => {
  let vna = 0;

  for (let iterator = 0; iterator < cashFlows.length; iterator++) {
    vna += cashFlows[iterator] / Math.pow(1 + rate, iterator);
  }

  return vna;
};

export const tirCalculation = (cashFlows: number[]): number => {
  return irr(cashFlows, 0.01);
};
export const tceaCalculation = (tir: number, annualPayments: number): number => {
  return Math.pow(1 + tir, annualPayments) - 1;
};
