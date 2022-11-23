import { z, ZodTypeAny } from "zod";

import { ValidationError } from "@/shared/api/types";

export const assertModel = async <T extends ZodTypeAny>(value: unknown, model: T): Promise<z.infer<T>> => {
  const parsed = await model.safeParseAsync(value);
  if (!parsed.success) {
    throw new ValidationError(parsed.error);
  }
  return parsed.data;
};

export const parseBody = async <T extends ZodTypeAny>(request: Request, model: T): Promise<z.infer<T>> => {
  const body = await request.json();
  return assertModel<T>(body, model);
};
