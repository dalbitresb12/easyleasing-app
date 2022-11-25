import type { Currencies } from "../models/common";

export const clamp = (value: number, options: { min?: number; max?: number; inclusive?: boolean }): number => {
  const { min, max, inclusive = false } = options;
  if (inclusive) {
    if (min && value <= min) return min;
    if (max && value >= max) return max;
  }
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
};

const locales = ["es-PE", "en-US"];

const currencyFormatters: Partial<Record<Currencies, Intl.NumberFormat>> = {};

export const createCurrencyFormatter = (currency: Currencies): Intl.NumberFormat => {
  let cached = currencyFormatters[currency];
  if (cached instanceof Intl.NumberFormat) {
    return cached;
  }

  cached = Intl.NumberFormat(locales, {
    style: "currency",
    currency: currency,
    currencySign: "accounting",
  });
  currencyFormatters[currency] = cached;

  return cached;
};

export const percentFormatter = Intl.NumberFormat(locales, {
  style: "percent",
  minimumFractionDigits: 7,
});
