import { roundMoney, IGV, IR } from "./utils.mjs";

const getInterest = (initialBalance, interestRate) => {
  return -(initialBalance * interestRate);
};

function frenchFeeCalculation(gracePeriod, initialBalance, interestRate, periods, currentPeriod) {
  if (gracePeriod === "Parcial") {
    return getInterest(initialBalance, interestRate);
  } else if (gracePeriod === "Sin plazo de gracia") {
    return -(
      (Math.pow(1 + interestRate, periods - currentPeriod + 1) * initialBalance * interestRate) /
      (Math.pow(1 + interestRate, periods - currentPeriod + 1) - 1)
    );
  }
  return 0;
}

function getAmortization(gracePeriod, fee, interest) {
  if (gracePeriod === "Sin plazo de gracia") {
    return fee - interest;
  }
  return 0;
}

function getFinalBalance(gracePeriod, initialBalance, interest, amortization) {
  if (gracePeriod === "Total") {
    return initialBalance - interest;
  } else if (gracePeriod === "Parcial") {
    return initialBalance;
  }
  return initialBalance + amortization;
}

function getTaxSavings(interest, insurance, periodicalCosts, depreciation) {
  return (interest + insurance + periodicalCosts + depreciation) * IR;
}

function getPeriodicalTaxes(fee, insurance, periodicalCosts, buyingOptionFee) {
  return (fee + insurance + periodicalCosts + buyingOptionFee) * IGV;
}

function getGrossFlow(fee, insurance, periodicalCosts, buyingOptionFee) {
  return fee + insurance + periodicalCosts + buyingOptionFee;
}

function getNetFlow(grossFlow, taxSavings) {
  return grossFlow - taxSavings;
}

function getFlowWithTaxes(grossFlow, periodicalTaxes) {
  return grossFlow + periodicalTaxes;
}

export const generatePaymentSchedule = (
  periods,
  interesRatePerPeriod,
  sellingValue,
  initialCosts,
  periodicalCosts,
  insuranceAmount,
  depreciation,
  buyingOptionFee,
) => {
  const montoLeasing = sellingValue + initialCosts;
  let saldoInicial = montoLeasing;
  const tipoPlazo = "";
  let cuota = 0;
  let intereses = 0;
  let amortizacion = 0;
  let saldoFinal = 0;
  let ahorroTributario = 0;
  let montoIGVPeriodico = 0;
  let flujoBruto = 0;
  let flujoIGV = 0;
  let flujoNeto = 0;

  const paymentSchedule = [];

  for (let currentPeriod = 1; currentPeriod <= periods; currentPeriod++) {
    intereses = getInterest(saldoInicial, interesRatePerPeriod);

    cuota = frenchFeeCalculation(tipoPlazo, saldoInicial, interesRatePerPeriod, periods, currentPeriod);
    amortizacion = getAmortization(tipoPlazo, cuota, intereses);
    saldoFinal = getFinalBalance(tipoPlazo, saldoInicial, intereses, amortizacion);

    ahorroTributario = getTaxSavings(intereses, insuranceAmount, periodicalCosts, depreciation);
    montoIGVPeriodico = getPeriodicalTaxes(
      cuota,
      insuranceAmount,
      periodicalCosts,
      currentPeriod === periods ? buyingOptionFee : 0,
    );
    flujoBruto = getGrossFlow(cuota, insuranceAmount, periodicalCosts, currentPeriod === periods ? buyingOptionFee : 0);

    flujoIGV = getFlowWithTaxes(flujoBruto, montoIGVPeriodico);
    flujoNeto = getNetFlow(flujoBruto, ahorroTributario);

    paymentSchedule.push({
      period: currentPeriod,
      gracePeriod: tipoPlazo,
      initialBalance: roundMoney(saldoInicial),
      interest: roundMoney(intereses),
      fee: roundMoney(cuota),
      amortization: roundMoney(amortizacion),
      insuranceAmount: roundMoney(insuranceAmount),
      periodicalCosts: roundMoney(periodicalCosts),
      buyingOptionFee: currentPeriod === periods ? roundMoney(buyingOptionFee) : 0,
      finalBalance: roundMoney(saldoFinal),
      depreciation: roundMoney(depreciation),
      taxSavings: roundMoney(ahorroTributario),
      IGV: roundMoney(montoIGVPeriodico),
      grossFlow: roundMoney(flujoBruto),
      flowWithTaxes: roundMoney(flujoIGV),
      netFlow: roundMoney(flujoNeto),
    });

    saldoInicial = saldoFinal;
  }

  return paymentSchedule;
};
