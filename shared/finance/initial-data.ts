const IGV = 0.18;

export const getInitialFee = (initialFeePercentage: number, sellingPrice: number): number => {
  return (initialFeePercentage / 100) * sellingPrice;
};

export const getNewSellingPrice = (oldSellingPrice: number, initialFee: number): number => {
  return oldSellingPrice - initialFee;
};

export const getIgvFee = (sellingPrice: number): number => {
  return (sellingPrice * IGV) / (1 + IGV);
};

export const getSellingValue = (sellingPrice: number, igvFee: number): number => {
  return sellingPrice - igvFee;
};

export const getBuyingOptionFee = (
  buyingOption: boolean,
  buyingOptionPercentage: number,
  sellingValue: number,
): number => {
  if (buyingOption === true) {
    return -(buyingOptionPercentage / 100) * sellingValue;
  }
  return 0;
};

export const getAnnualPayments = (paymentFrequency: number) => {
  return 360 / paymentFrequency;
};
export const getPeriods = (loanTime: number, paymentFrequency: number) => {
  return (loanTime * 360) / paymentFrequency;
};

export const getDeprecitaion = (sellingValue: number, periods: number): number => {
  return -(sellingValue / periods);
};
