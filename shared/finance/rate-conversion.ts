import { assertFrequencyToDays, TimeFrequencies } from "../models/common";

export const effectiveToEffectiveRate = (
  rate: number,
  oldFrequency: TimeFrequencies | number,
  newFrequency: TimeFrequencies | number,
): number => {
  oldFrequency = assertFrequencyToDays(oldFrequency);
  newFrequency = assertFrequencyToDays(newFrequency);
  return Math.pow(1 + rate / 100, newFrequency / oldFrequency) - 1;
};

export const nominalRateToEffectiveRate = (rate: number, m: number, n: number): number => {
  return Math.pow(1 + rate / 100 / m, n) - 1;
};
