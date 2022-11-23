export interface Payment {
  period: number;
  gracePeriod: string;
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
