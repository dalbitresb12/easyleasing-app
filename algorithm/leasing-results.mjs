export const getLeasingResults = (paymentSchedule, buyingOptionFee) => {
  let totalInterest = 0;
  let totalPeriodicalCosts = 0;
  let totalAmortization = 0;

  for (const payment of paymentSchedule) {
    totalAmortization += payment.amortization;
    if (!(payment.gracePeriod === "Total")) {
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
