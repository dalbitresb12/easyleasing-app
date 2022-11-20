import { z, ZodObject, ZodRawShape } from "zod";

import { ValidationError } from "../types/httperror";

export const parseBody = async <R extends ZodRawShape, T extends ZodObject<R>>(
  request: Request,
  model: T,
): Promise<z.infer<T>> => {
  const body = await request.json();
  const parsed = model.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
};
