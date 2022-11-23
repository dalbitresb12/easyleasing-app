export const convertirTasaEfectivaEnEfectiva = (tasa, frecuenciaAntigua, frecuenciaNueva) => {
  return Math.pow(1 + tasa / 100, frecuenciaNueva / frecuenciaAntigua) - 1;
};

export const convertirTasaNominalEnEfectiva = (tasa, m, n) => {
  return Math.pow(1 + tasa / 100 / m, n) - 1;
};
