export const IGV = 0.18,
  IR = 0.3;

export const currencyFormatter = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });
export const inputPercentageFormatter = new Intl.NumberFormat("es-PE", { style: "percent", minimumFractionDigits: 2 });
export const outputPercentageFormatter = new Intl.NumberFormat("es-PE", { style: "percent", minimumFractionDigits: 7 });

export const frequencies = [
  "Diaria",
  "Quincenal",
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Cuatrimestral",
  "Semestral",
  "Anual",
];

export function roundMoney(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function inDays(frequency) {
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
