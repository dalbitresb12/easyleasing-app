export const capitalize = (value?: string): string => {
  if (!value) return "";
  return `${value.charAt(0).toUpperCase()}${value.substring(1)}`;
};
