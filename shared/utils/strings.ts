export const capitalize = (value?: string): string => {
  if (!value) return "";
  return `${value.charAt(0).toUpperCase()}${value.substring(1)}`;
};

export const pluralize = (count: number, word: string, ending: string): string => {
  if (count === 1) return word;
  return `${word}${ending}`;
};
