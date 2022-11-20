import { ZodErrorMap, ZodIssueCode, ZodParsedType, setErrorMap } from "zod";

const joinValues = <T extends unknown[]>(array: T, separator = " | "): string => {
  return array.map(val => (typeof val === "string" ? `'${val}'` : val)).join(separator);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertNever = (_: never): never => {
  throw new Error();
};

const capitalize = (value: string): string => `${value.charAt(0).toUpperCase()}${value.substring(1)}`;

const errorMap: ZodErrorMap = (issue, ctx) => {
  let message: string | undefined;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Requerido";
      } else {
        message = ctx.defaultError;
      }
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Valor inválido. Valores aceptados: ${joinValues(issue.options)}, se recibió '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Fecha inválida`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("startsWith" in issue.validation) {
          message = `Valor inválido: debe comenzar con "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Valor inválido: debe terminar con "${issue.validation.endsWith}"`;
        } else {
          assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `${capitalize(issue.validation)} inválido`;
      } else {
        message = "Valor inválido";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `La lista debe contener ${issue.inclusive ? `al menos` : `más de`} ${issue.minimum} caracter(es)`;
      else if (issue.type === "string")
        message = `El valor debe contener ${issue.inclusive ? `al menos` : `más de`} ${issue.minimum} caracter(es)`;
      else if (issue.type === "number")
        message = `El número debe ser mayor ${issue.inclusive ? `o igual` : ``} a ${issue.minimum}`;
      else if (issue.type === "date")
        message = `La fecha debe ser después ${issue.inclusive ? `o igual a ` : `de `}${new Date(issue.minimum)}`;
      else message = "Valor inválido";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `La lista debe contener ${issue.inclusive ? `al menos` : `más de`} ${issue.maximum} caracter(es)`;
      else if (issue.type === "string")
        message = `El valor debe contener ${issue.inclusive ? `al menos` : `menos de`} ${issue.maximum} caracter(es)`;
      else if (issue.type === "number")
        message = `El número debe ser menor ${issue.inclusive ? `o igual` : ``} a ${issue.maximum}`;
      else if (issue.type === "date")
        message = `La fecha debe ser antes ${issue.inclusive ? `o igual a ` : `de `}${new Date(issue.maximum)}`;
      else message = "Valor inválido";
      break;
    case ZodIssueCode.custom:
      message = `Valor inválido`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `El número debe ser multiplo de ${issue.multipleOf}`;
      break;
    default:
      message = ctx.defaultError;
  }
  // This shouldn't happen
  if (!message) throw new Error();
  // Fallback to default message
  return { message };
};

export const setupZodErrorMap = () => {
  setErrorMap(errorMap);
};
