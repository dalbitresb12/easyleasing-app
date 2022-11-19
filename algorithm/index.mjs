import inquirer from "inquirer";
import { irr } from "financial";

const currencyFormatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const percentageFormatter = new Intl.NumberFormat("es-PE", { style: "percent", minimumFractionDigits: 2 });

function roundMoney(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function inDays(frequency) {
  switch (frequency) {
    case "Diaria":
      frequency = 1;
      break;
    case "Quincenal":
      frequency = 15;
      break;
    case "Mensual":
      frequency = 30;
      break;
    case "Bimestral":
      frequency = 60;
      break;
    case "Trimestral":
      frequency = 90;
      break;
    case "Cuatrimestral":
      frequency = 120;
      break;
    case "Semestral":
      frequency = 180;
      break;
    case "Anual":
      frequency = 360;
      break;
  }
  return frequency;
}

const frequencies = [
  "Diaria",
  "Quincenal",
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Cuatrimestral",
  "Semestral",
  "Anual",
];

const positiveValidation = value => {
  const parsed = Number(value);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return true;
  }
  return "Ingrese un valor positivo";
};

const loanTimeValidation = value => {
  const parsed = Number(value);
  if (!Number.isNaN(parsed) && parsed >= 2) {
    return true;
  }
  return "Ingrese un valor mayor a 2";
};

const percentageValidation = value => {
  const parsed = Number(value);
  if (!Number.isNaN(parsed) && parsed > 0 && parsed < 100) {
    return true;
  }
  return "Ingrese un valor porcentual adecuado";
};

const extraCostValidation = (value, extraCosts) => {
  if (extraCosts.valueType === "Monetario") {
    return positiveValidation(value);
  }
  return percentageValidation(value);
};

const IGV = 0.18;
const IR = 0.3;

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
      transformer: input => percentageFormatter.format(input / 100),
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
      transformer: input => percentageFormatter.format(input / 100),
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
      transformer: input => percentageFormatter.format(input / 100),
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
            return percentageFormatter.format(value / 100);
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

  const tasaIndicadorBruto = await inquirer.prompt({
    name: "descuentoKs",
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
    transformer: input => percentageFormatter.format(input / 100),
  });

  const tasaIndicadorNeto = await inquirer.prompt({
    name: "descuentoWACC",
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
    transformer: input => percentageFormatter.format(input / 100),
  });

  const descuentoKs = Math.pow(1 + tasaIndicadorBruto.descuentoKs / 100, inputs.paymentFrequency / 360) - 1;
  const descuentoWACC = Math.pow(1 + tasaIndicadorNeto.descuentoWACC / 100, inputs.paymentFrequency / 360) - 1;

  const percentageInitialFee = inputs.percentageInitialFee / 100;

  const initialFee = percentageInitialFee * inputs.sellingPrice;

  const newSellingPrice = inputs.sellingPrice - initialFee;

  const loanTimeInDays = inputs.loanTime * 360;
  const montoIGV = roundMoney((newSellingPrice * IGV) / (1 + IGV));
  const sellingValue = roundMoney(newSellingPrice - montoIGV);

  const cuotasAnuales = 360 / inputs.paymentFrequency;
  const periodos = loanTimeInDays / inputs.paymentFrequency;

  let montoRecompra = 0;
  if (inputs.buyingOption) {
    montoRecompra = -(sellingValue * (inputs.buyingOptionPercentage / 100));
  }

  let totalInitialCosts = 0;
  let periodicCosts = 0;
  let insuranceAmount = 0;

  for (const extraCost of extraCosts) {
    if (extraCost.type === "Inicial" && extraCost.valueType === "Monetario") {
      totalInitialCosts += extraCost.value;
    } else if (extraCost.type === "Inicial" && extraCost.valueType === "Porcentual") {
      totalInitialCosts += (extraCost.value / 100) * inputs.sellingPrice;
    } else if (extraCost.type === "Periódico" && extraCost.valueType === "Monetario") {
      periodicCosts -= extraCost.value;
    } else {
      insuranceAmount = -(((extraCost.value / 100) * newSellingPrice) / cuotasAnuales);
    }
  }

  const leasingAmount = totalInitialCosts + sellingValue;

  let periodicalInterestRate = 0;

  if (inputs.interestRateType === "Nominal") {
    const m = inputs.interestRateFrequency / inputs.capitalizacion;
    const n = inputs.paymentFrequency / inputs.capitalizacion;
    periodicalInterestRate = Math.pow(1 + inputs.interestRate / 100 / m, n) - 1;
  } else {
    periodicalInterestRate =
      Math.pow(1 + inputs.interestRate / 100, inputs.paymentFrequency / inputs.interestRateFrequency) - 1;
  }

  console.log(`\nPrecio de venta del activo: S/ ${inputs.sellingPrice}`);
  console.log(`Cuota inicial: S/ ${initialFee}\n`);
  console.log(`Nuevo precio de venta S/ ${newSellingPrice}`);
  console.log(`Monto de IGV: S/ ${montoIGV}`);
  console.log(`Valor de venta del activo: S/ ${sellingValue}`);
  console.log(`Total por costos iniciales: S/ ${totalInitialCosts}`);
  console.log(`Monto del leasing: S/ ${leasingAmount}`);

  console.log(`\nN° cuotas al año: ${cuotasAnuales}`);
  console.log(`N° periodos de pago: ${periodos}`);
  console.log(`Frecuencia de pago: ${inputs.paymentFrequency} días\n`);

  console.log(`Tipo de tasa de interés: ${inputs.interestRateType}`);
  console.log(`Tasa efectiva del periodo: ${periodicalInterestRate * 100}%\n`);

  console.log(`Tasa descuento Ks equivalente: ${descuentoKs * 100}%`);
  console.log(`Tasa descuento WACC equivalente: ${descuentoWACC * 100}%`);

  // Cronograma de pagos

  let tipoPlazo = "";
  let saldoInicial = leasingAmount;
  let cuota = 0;
  let intereses = 0;
  let amortizacion = 0;
  let saldoFinal = 0;
  const depreciacion = -(sellingValue / periodos);
  let ahorroTributario = 0;
  let montoIGVPeriodico = 0;
  let flujoBruto = 0;
  let flujoIGV = 0;
  let flujoNeto = 0;

  let totalIntereses = 0;
  let totalAmortizacion = 0;
  let totalCostosPeriodicos = 0;
  let totalSeguro = 0;

  let vnaFlujoBruto = 0;
  let vnaFlujoNeto = 0;

  const flujosBrutos = [leasingAmount];
  const flujosNetos = [leasingAmount];

  for (let periodo = 1; periodo <= periodos; periodo++) {
    console.log(`= = = = = Periodo ${periodo} = = = = =`);

    intereses = -(periodicalInterestRate * saldoInicial);

    if (periodo < periodos) {
      const input = await inquirer.prompt({
        name: "plazoDeGracia",
        type: "list",
        message: `Escoja el tipo de plazo de gracia: `,
        choices: ["Total", "Parcial", "Sin plazo de gracia"],
      });

      tipoPlazo = input.plazoDeGracia;
    } else {
      tipoPlazo = "Sin plazo de gracia";
    }

    if (tipoPlazo === "Total") {
      cuota = 0;
      amortizacion = 0;
      saldoFinal = saldoInicial - intereses;
    } else if (tipoPlazo === "Parcial") {
      cuota = intereses;
      amortizacion = 0;
      saldoFinal = saldoInicial + amortizacion;
    } else {
      cuota = -(
        (Math.pow(1 + periodicalInterestRate, periodos - periodo + 1) * saldoInicial * periodicalInterestRate) /
        (Math.pow(1 + periodicalInterestRate, periodos - periodo + 1) - 1)
      );
      amortizacion = cuota - intereses;
      saldoFinal = saldoInicial + amortizacion;
    }

    console.log(`\nSaldo inicial: ${currencyFormatter.format(roundMoney(saldoInicial))}`);
    console.log(`Intereses: ${currencyFormatter.format(roundMoney(intereses))}`);
    console.log(`Cuota: ${currencyFormatter.format(roundMoney(cuota))}`);
    console.log(`Amortización: ${currencyFormatter.format(roundMoney(amortizacion))}`);
    console.log(`Monto de seguro contra todo riesgo: ${currencyFormatter.format(roundMoney(insuranceAmount))}`);
    console.log(`Costos periódicos: ${currencyFormatter.format(roundMoney(periodicCosts))}`);

    ahorroTributario = (intereses + insuranceAmount + periodicCosts + depreciacion) * IR;
    montoIGVPeriodico = (cuota + insuranceAmount + periodicCosts) * IGV;
    flujoBruto = cuota + insuranceAmount + periodicCosts;

    if (inputs.buyingOption && periodo === periodos) {
      montoIGVPeriodico = (cuota + insuranceAmount + periodicCosts + montoRecompra) * IGV;
      flujoBruto = cuota + insuranceAmount + periodicCosts + montoRecompra;
      console.log(`Monto de recompra: ${currencyFormatter.format(roundMoney(montoRecompra))}`);
    }

    flujoIGV = flujoBruto + montoIGVPeriodico;
    flujoNeto = flujoBruto - ahorroTributario;

    vnaFlujoBruto += flujoBruto / Math.pow(1 + descuentoKs, periodo);
    vnaFlujoNeto += flujoNeto / Math.pow(1 + descuentoWACC, periodo);

    console.log(`Saldo final: ${currencyFormatter.format(roundMoney(saldoFinal))}`);
    console.log(`Depreciación: ${currencyFormatter.format(roundMoney(depreciacion))}`);
    console.log(`Ahorro tributario: ${currencyFormatter.format(roundMoney(ahorroTributario))}`);
    console.log(`IGV: ${currencyFormatter.format(roundMoney(montoIGVPeriodico))}`);
    console.log(`Flujo Bruto: ${currencyFormatter.format(roundMoney(flujoBruto))}`);
    console.log(`Flujo con IGV: ${currencyFormatter.format(roundMoney(flujoIGV))}`);
    console.log(`Flujo Neto: ${currencyFormatter.format(roundMoney(flujoNeto))}\n`);

    totalAmortizacion = totalAmortizacion + amortizacion;

    if (!(tipoPlazo === "Total")) {
      totalIntereses = totalIntereses + intereses;
    }

    totalCostosPeriodicos += periodicCosts;
    totalSeguro += insuranceAmount;
    saldoInicial = saldoFinal;

    flujosBrutos.push(roundMoney(flujoBruto));
    flujosNetos.push(roundMoney(flujoNeto));
  }

  const desembolsoTotal = totalIntereses + totalAmortizacion + totalSeguro + totalCostosPeriodicos + montoRecompra;

  console.log(`Monto total por intereses: ${currencyFormatter.format(roundMoney(-totalIntereses))}`);
  console.log(`Monto total amortizado: ${currencyFormatter.format(roundMoney(-totalAmortizacion))}`);
  console.log(`Monto total por costos periódicos: ${currencyFormatter.format(roundMoney(-totalCostosPeriodicos))}`);
  console.log(`Monto total por seguro contra todo riesgo: ${currencyFormatter.format(roundMoney(-totalSeguro))}`);
  console.log(`Desembolso total: ${currencyFormatter.format(roundMoney(-desembolsoTotal))}\n`);

  vnaFlujoBruto = vnaFlujoBruto + leasingAmount;
  vnaFlujoNeto = vnaFlujoNeto + leasingAmount;
  const tirFlujoBruto = irr(flujosBrutos, 0.01);
  const tirFlujoNeto = irr(flujosNetos, 0.01);

  const tceaFlujoBruto = Math.pow(1 + tirFlujoBruto, cuotasAnuales) - 1;
  const tceaFlujoNeto = Math.pow(1 + tirFlujoNeto, cuotasAnuales) - 1;

  console.log("= = = = = Indicadores de Rentabilidad = = = = =");
  console.log(`TCEA Flujo Bruto: ${percentageFormatter.format(tceaFlujoBruto)}`);
  console.log(`TCEA Flujo Neto: ${percentageFormatter.format(tceaFlujoNeto)}`);
  console.log(`VAN Flujo Bruto: ${currencyFormatter.format(roundMoney(vnaFlujoBruto))}`);
  console.log(`VAN Flujo Neto: ${currencyFormatter.format(roundMoney(vnaFlujoNeto))}`);
  console.log(`TIR Flujo Bruto: ${percentageFormatter.format(tirFlujoBruto)}`);
  console.log(`TIR Flujo Neto: ${percentageFormatter.format(tirFlujoNeto)}`);
};

main();
