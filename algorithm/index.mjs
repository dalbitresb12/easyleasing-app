// import { irr } from "financial";
import inquirer from "inquirer";

import {
  getInitialFee,
  getIgvFee,
  getNewSellingPrice,
  getSellingValue,
  getAnnualPayments,
  getPeriods,
  getBuyingOptionFee,
  getInitialCosts,
  getPeriodicalCosts,
  getInsuranceAmount,
  getDeprecitaion,
  getInterestRatePerPeriod,
  getLeasingAmount,
} from "./initial-data.mjs";
import { getLeasingResults, getGrossFlows, getNetFlows } from "./leasing-results.mjs";
import { generatePaymentSchedule } from "./payment-calculations.mjs";
import { tceaCalculation, tirCalculation, vnaCalculation } from "./profitability-indicator.mjs";
import { effectiveRateToEffectiveRate } from "./rate-conversion.mjs";
import {
  inDays,
  frequencies,
  currencyFormatter,
  inputPercentageFormatter,
  outputPercentageFormatter,
} from "./utils.mjs";
import { positiveValidation, percentageValidation, extraCostValidation, loanTimeValidation } from "./validations.mjs";

const main = async () => {
  const inputs = await inquirer.prompt([
    {
      name: "sellingPrice",
      type: "input",
      message: "Especifique el precio de venta del activo: ",
      validate: positiveValidation,
      filter: value => {
        const parsed = Number(value);
        if (positiveValidation(parsed) === true) {
          return parsed;
        }
        return value;
      },
      transformer: input => currencyFormatter.format(input),
    },
    {
      name: "percentageInitialFee",
      type: "input",
      message: "Ingrese el porcentaje de cuota inicial: ",
      validate: percentageValidation,
      filter: value => {
        const parsed = Number(value);
        if (percentageValidation(parsed) === true) {
          return parsed;
        }
        return value;
      },
      transformer: input => inputPercentageFormatter.format(input / 100),
    },
    {
      name: "buyingOption",
      type: "confirm",
      message: "¿Adquirirá el activo al finalizar la operación de leasing? ",
      default: true,
    },
    {
      name: "buyingOptionPercentage",
      type: "input",
      message: "Especifique el valor del porcentaje para la recompra: ",
      validate: percentageValidation,
      when: answers => answers.buyingOption,
      filter: value => {
        const parsed = Number(value);
        if (percentageValidation(parsed) === true) {
          return parsed;
        }
        return value;
      },
      transformer: input => inputPercentageFormatter.format(input / 100),
    },
    {
      name: "paymentFrequency",
      type: "list",
      message: "Elija su frecuencia de pago: ",
      choices: frequencies,
      filter(paymentFrequency) {
        return inDays(paymentFrequency);
      },
    },
    {
      name: "loanTime",
      type: "input",
      message: "Especifique el tiempo total de pago (mínimo 2): ",
      validate: loanTimeValidation,
      filter: value => {
        const parsed = Number(value);
        if (loanTimeValidation(parsed) === true) {
          return parsed;
        }
        return value;
      },
      transformer: input => `${input} años`,
    },
    {
      name: "interestRateType",
      type: "list",
      message: "Elija el tipo de tasa de interés: ",
      choices: ["Nominal", "Efectiva"],
    },
    {
      name: "capitalizacion",
      type: "list",
      message: "Especifique la capitalizacion de la tasa nominal: ",
      choices: frequencies,
      when: answers => answers.interestRateType === "Nominal",
      filter: capitalizacion => inDays(capitalizacion),
    },
    {
      name: "interestRateFrequency",
      type: "list",
      message: "Especifique la frecuencia de la tasa de interés: ",
      choices: frequencies,
      filter(interestRateFrequency) {
        return inDays(interestRateFrequency);
      },
    },
    {
      name: "interestRate",
      type: "input",
      message: "Ingrese el valor de la tasa de interés: ",
      validate: percentageValidation,
      filter: value => {
        const parsed = Number(value);
        if (percentageValidation(parsed) === true) {
          return parsed;
        }
        return value;
      },
      transformer: input => inputPercentageFormatter.format(input / 100),
    },
    {
      name: "extraCosts",
      type: "confirm",
      message: "¿Desea registrar costos extra (iniciales o periódicos)?",
      default: true,
    },
  ]);

  const extraCosts = [];

  if (inputs.extraCosts) {
    do {
      const data = await inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "Nombre del costo: ",
          validate: input => input.length > 0,
        },
        {
          name: "type",
          type: "list",
          message: "Elija el tipo de gasto: ",
          choices: ["Inicial", "Periódico"],
        },
        {
          name: "valueType",
          type: "list",
          message: "Indique el tipo de valor: ",
          choices: ["Monetario", "Porcentual"],
        },
        {
          name: "value",
          type: "input",
          message: "Ingrese el valor: ",
          validate: extraCostValidation,
          filter: (value, answers) => {
            const parsed = Number(value);
            if (extraCostValidation(parsed, answers) === true) {
              return parsed;
            }
            return value;
          },
          transformer: (value, answers) => {
            if (answers.valueType === "Monetario") {
              return currencyFormatter.format(value);
            }
            return inputPercentageFormatter.format(value / 100);
          },
        },
        {
          name: "keepAdding",
          type: "confirm",
          message: "¿Quiere continuar añadiendo costos?",
          default: true,
        },
      ]);
      extraCosts.push(data);
    } while (extraCosts[extraCosts.length - 1].keepAdding);
  }

  const grossIndicator = await inquirer.prompt({
    name: "ksRate",
    type: "input",
    message: "Tasa de descuento Ks: ",
    validate: percentageValidation,
    filter: value => {
      const parsed = Number(value);
      if (percentageValidation(parsed) === true) {
        return parsed;
      }
      return value;
    },
    transformer: input => inputPercentageFormatter.format(input / 100),
  });

  const netIndicator = await inquirer.prompt({
    name: "waccRate",
    type: "input",
    message: "Tasa de descuento WACC: ",
    validate: percentageValidation,
    filter: value => {
      const parsed = Number(value);
      if (percentageValidation(parsed) === true) {
        return parsed;
      }
      return value;
    },
    transformer: input => inputPercentageFormatter.format(input / 100),
  });

  const initialFee = getInitialFee(inputs.percentageInitialFee, inputs.sellingPrice);
  const newSellingPrice = getNewSellingPrice(inputs.sellingPrice, initialFee);
  const igvFee = getIgvFee(newSellingPrice);
  const sellingValue = getSellingValue(newSellingPrice, igvFee);
  const annualPayments = getAnnualPayments(inputs.paymentFrequency);
  const periods = getPeriods(inputs.loanTime, inputs.paymentFrequency);

  const buyingOptionFee = getBuyingOptionFee(inputs.buyingOption, inputs.buyingOptionPercentage, sellingValue);

  const depreciation = getDeprecitaion(sellingValue, periods);
  const initialCosts = getInitialCosts(inputs, extraCosts);
  const periodicalCosts = getPeriodicalCosts(extraCosts);
  const insuranceAmount = getInsuranceAmount(extraCosts, newSellingPrice, annualPayments);

  const leasingAmount = getLeasingAmount(initialCosts, sellingValue);

  const interesRatePerPeriod = getInterestRatePerPeriod(inputs);

  const ksRate = effectiveRateToEffectiveRate(grossIndicator.ksRate, 360, inputs.paymentFrequency);
  const waccRate = effectiveRateToEffectiveRate(netIndicator.waccRate, 360, inputs.paymentFrequency);

  const gracePeriods = [];

  for (let period = 1; period < periods; period++) {
    const gracePeriod = await inquirer.prompt({
      name: "type",
      type: "list",
      message: `Escoja el tipo de plazo de gracia: `,
      choices: ["Total", "Parcial", "Sin plazo de gracia"],
    });

    gracePeriods.push(gracePeriod.type);
  }

  // Last period without grace by default
  gracePeriods.push("Sin plazo de gracia");

  /* *** RESULTS ***  */
  console.log(`Payment Frequency: ${inputs.paymentFrequency} days\n`);
  console.log(`Net Price: ${currencyFormatter.format(sellingValue)}`);
  console.log(`Leasing Amount: ${currencyFormatter.format(leasingAmount)}`);
  console.log(`Equivalent Interest Rate: ${outputPercentageFormatter.format(interesRatePerPeriod)}\n`);
  console.log(`Total Installments: ${periods} installments`);

  /* *** (OPTIONAL) ***  */
  console.log(`\nSelling Price: ${currencyFormatter.format(inputs.sellingPrice)}`);
  console.log(`Initial Fee: ${currencyFormatter.format(initialFee)}\n`);
  console.log(`New Selling Price: ${currencyFormatter.format(newSellingPrice)}`);
  console.log(`IGV Fee: ${currencyFormatter.format(igvFee)}`);
  console.log(`Initial Costs: ${currencyFormatter.format(initialCosts)}`);
  console.log(`Buying Option Fee: ${currencyFormatter.format(buyingOptionFee)}`);
  console.log(`\nAnnual installments: ${annualPayments} installments`);

  console.log(`Tasa descuento Ks equivalente: ${outputPercentageFormatter.format(ksRate)}`);
  console.log(`Tasa descuento WACC equivalente: ${outputPercentageFormatter.format(waccRate)}`);

  /* *** PAYMENT SCHEDULE (TABLE) *** */

  const paymentSchedule = generatePaymentSchedule(
    gracePeriods,
    periods,
    interesRatePerPeriod,
    sellingValue,
    initialCosts,
    periodicalCosts,
    insuranceAmount,
    depreciation,
    buyingOptionFee,
  );

  const grossFlows = getGrossFlows(leasingAmount, paymentSchedule);
  const netFlows = getNetFlows(leasingAmount, paymentSchedule);

  for (const payment of paymentSchedule) {
    console.log(`\nN° ${payment.period}`);
    console.log(`Grace Period: ${payment.gracePeriod}`);
    console.log(`Initial Balance: ${currencyFormatter.format(payment.initialBalance)}`);
    console.log(`Interest: ${currencyFormatter.format(payment.interest)}`);
    console.log(`Fee: ${currencyFormatter.format(payment.fee)}`);
    console.log(`Amortization: ${currencyFormatter.format(payment.amortization)}`);
    console.log(`Insurance Amount: ${currencyFormatter.format(payment.insuranceAmount)}`);
    console.log(`Periodical Costs: ${currencyFormatter.format(payment.periodicalCosts)}`);
    console.log(`Buying Option Fee: ${currencyFormatter.format(payment.buyingOptionFee)}`);
    console.log(`Final Balance: ${currencyFormatter.format(payment.finalBalance)}`);
    console.log(`Depreciation: ${currencyFormatter.format(payment.depreciation)}`);
    console.log(`Tax Savings: ${currencyFormatter.format(payment.taxSavings)}`);
    console.log(`Taxes: ${currencyFormatter.format(payment.IGV)}`);
    console.log(`Gross Flow: ${currencyFormatter.format(payment.grossFlow)}`);
    console.log(`Flow w/Taxes: ${currencyFormatter.format(payment.flowWithTaxes)}`);
    console.log(`Net Flow: ${currencyFormatter.format(payment.netFlow)}`);
  }

  const leasingResults = getLeasingResults(paymentSchedule, buyingOptionFee);

  console.log(`\nInterests: ${currencyFormatter.format(leasingResults.totalInterest)}`);
  console.log(`Capital Amortization: ${currencyFormatter.format(leasingResults.totalAmortization)}`);
  console.log(`Risk Insurance: ${currencyFormatter.format(leasingResults.totalInsurance)}`);
  console.log(`Monthly Fee: ${currencyFormatter.format(leasingResults.totalPeriodicalCosts)}`);
  console.log(`Buyback: ${currencyFormatter.format(buyingOptionFee)}`);
  console.log(`Total Payment: ${currencyFormatter.format(leasingResults.totalPayment)}`);

  /* *** PROFITABILITY RATIOS *** */

  const grossFlowsVna = vnaCalculation(grossFlows, ksRate);
  const netFlowsVna = vnaCalculation(netFlows, waccRate);

  const grossFlowsTir = tirCalculation(grossFlows);
  const netFlowsTir = tirCalculation(netFlows);

  const grossFlowsTcea = tceaCalculation(grossFlowsTir, annualPayments);
  const netFlowsTcea = tceaCalculation(netFlowsTir, annualPayments);

  console.log(`Gross Cash Flow, TCEA: ${outputPercentageFormatter.format(grossFlowsTcea)}`);
  console.log(`Net Cash Flow, TCEA: ${outputPercentageFormatter.format(netFlowsTcea)}`);
  console.log(`Gross Cash Flow, VNA: ${currencyFormatter.format(grossFlowsVna)}`);
  console.log(`Net Cash Flow, VNA: ${currencyFormatter.format(netFlowsVna)}`);
};

main();
