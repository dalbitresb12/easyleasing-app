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
