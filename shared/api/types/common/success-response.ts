import { z } from "zod";

export const SuccessResponse = z.object({
  success: z.boolean(),
});
export type SuccessResponse = z.infer<typeof SuccessResponse>;
