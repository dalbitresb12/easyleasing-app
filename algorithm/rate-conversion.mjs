export const effectiveRateToEffectiveRate = (rate, oldFrequency, newFrequency) => {
  return Math.pow(1 + rate / 100, newFrequency / oldFrequency) - 1;
};

export const nominalRateToEffectiveRate = (rate, m, n) => {
  return Math.pow(1 + rate / 100 / m, n) - 1;
};
