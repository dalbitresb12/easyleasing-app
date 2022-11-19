import inquirer from "inquirer";

const currencyFormatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
const percentageFormatter = new Intl.NumberFormat("es-PE", { style: "percent" });

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
      when: answers => !answers.buyingOpyition,
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
      transformer: input => `${input}%`,
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
            return `${value}%`;
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
    montoRecompra = sellingValue * (inputs.buyingOptionPercentage / 100);
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
      periodicCosts += extraCost.value;
    } else {
      insuranceAmount = ((extraCost.value / 100) * newSellingPrice) / cuotasAnuales;
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

  // Cronograma de pagos

  let tipoPlazo = "";
  let saldoInicial = leasingAmount;
  let cuota = 0;
  let intereses = 0;
  let amortizacion = 0;
  let saldoFinal = 0;
  const depreciacion = sellingValue / periodos;
  let ahorroTributario = 0;
  let montoIGVPeriodico = 0;
  let flujoBruto = 0;
  let flujoIGV = 0;
  let flujoNeto = 0;

  let totalIntereses = 0;
  let totalAmortizacion = 0;
  let totalCostosPeriodicos = 0;
  let totalSeguro = 0;

  for (let periodo = 1; periodo <= periodos; periodo++) {
    console.log(`= = = = = Periodo ${periodo} = = = = =`);

    intereses = periodicalInterestRate * saldoInicial;

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
      saldoFinal = saldoInicial + intereses;
    } else if (tipoPlazo === "Parcial") {
      cuota = intereses;
      amortizacion = 0;
      saldoFinal = saldoInicial;
    } else {
      cuota =
        (Math.pow(1 + periodicalInterestRate, periodos - periodo + 1) * saldoInicial * periodicalInterestRate) /
        (Math.pow(1 + periodicalInterestRate, periodos - periodo + 1) - 1);

      amortizacion = cuota - intereses;
      saldoFinal = saldoInicial - amortizacion;
    }

    console.log(`\nSaldo inicial: S/ ${roundMoney(saldoInicial)}`);
    console.log(`Intereses: S/ ${roundMoney(intereses)}`);
    console.log(`Cuota: S/ ${roundMoney(cuota)}`);
    console.log(`Amortización: S/ ${roundMoney(amortizacion)}`);
    console.log(`Monto de seguro contra todo riesgo: S/ ${roundMoney(insuranceAmount)}`);
    console.log(`Costos periódicos: S/. ${roundMoney(periodicCosts)}`);

    ahorroTributario = (intereses + insuranceAmount + periodicCosts + depreciacion) * IR;
    montoIGVPeriodico = (cuota + insuranceAmount + periodicCosts) * IGV;
    flujoBruto = cuota + insuranceAmount + periodicCosts;

    if (inputs.buyingOption && periodo === periodos) {
      montoIGVPeriodico = (cuota + insuranceAmount + periodicCosts + montoRecompra) * IGV;
      flujoBruto = cuota + insuranceAmount + periodicCosts + montoRecompra;
      console.log(`Monto de recompra: S/ ${roundMoney(montoRecompra)}`);
    }

    flujoIGV = flujoBruto + montoIGVPeriodico;
    flujoNeto = flujoBruto - ahorroTributario;

    console.log(`Saldo final: S/ ${roundMoney(saldoFinal)}`);
    console.log(`Depreciación: S/ ${roundMoney(depreciacion)}`);
    console.log(`Ahorro tributario: S/ ${roundMoney(ahorroTributario)}`);
    console.log(`IGV: ${roundMoney(montoIGVPeriodico)}`);
    console.log(`Flujo Bruto: S/ ${roundMoney(flujoBruto)}`);
    console.log(`Flujo con IGV: S/ ${roundMoney(flujoIGV)}`);
    console.log(`Flujo Neto:S/ ${roundMoney(flujoNeto)}\n`);

    totalAmortizacion = totalAmortizacion + amortizacion;

    if (!(tipoPlazo === "Total")) {
      totalIntereses = totalIntereses + intereses;
    }

    totalCostosPeriodicos += periodicCosts;
    totalSeguro += insuranceAmount;
    saldoInicial = saldoFinal;
  }

  const desembolsoTotal = totalIntereses + totalAmortizacion + totalSeguro + totalCostosPeriodicos + montoRecompra;

  console.log(`Monto total por intereses: S/ ${roundMoney(totalIntereses)}`);
  console.log(`Monto total amortizado: S/ ${roundMoney(totalAmortizacion)}`);
  console.log(`Monto total por costos periódicos: S/ ${roundMoney(totalCostosPeriodicos)}`);
  console.log(`Monto total por seguro contra todo riesgo: S/ ${roundMoney(totalSeguro)}`);
  console.log(`Desembolso total: S/ ${roundMoney(desembolsoTotal)}`);
};

main();
