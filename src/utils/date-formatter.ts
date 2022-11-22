const formatter = Intl.DateTimeFormat(["es-PE", "en-US"]);

export const formatDate = (date: Date) => {
  return formatter.format(date);
};
