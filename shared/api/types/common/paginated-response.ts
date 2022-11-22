import { AnyZodObject, z } from "zod";

export const PaginatedResponse = <T extends AnyZodObject>(schema: T) => {
  return z.object({
    data: z.array(schema).default([]),
    metadata: z
      .object({
        cursor: z.string().optional(),
        limit: z.number().optional(),
        complete: z.boolean(),
      })
      .default({ complete: true }),
  });
};
