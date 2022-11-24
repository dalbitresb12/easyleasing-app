import type { GracePeriod } from "./grace-period";

export interface Payment {
  period: number;
  gracePeriod: GracePeriod;
  initialBalance: number;
  interest: number;
  fee: number;
  amortization: number;
  periodicalCosts: number;
  buyingOptionFee: number;
  finalBalance: number;
  depreciation: number;
  taxSavings: number;
  IGV: number;
  grossFlow: number;
  flowWithTaxes: number;
  netFlow: number;
}
