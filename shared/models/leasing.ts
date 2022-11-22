import { z } from "zod";

import { Currencies, ExpenseType, InterestRateTypes, NumericalType, TimeFrequencies } from "./common";
import { User } from "./user";

export const LeasingExtras = z
  .object({
    name: z.string(),
    valueType: NumericalType,
    value: z.number(),
    expenseType: ExpenseType,
  })
  .superRefine(({ valueType, value }, ctx) => {
    if (valueType === "percent" && value > 100) {
      ctx.addIssue({
        code: "too_big",
        type: "number",
        maximum: 100,
        inclusive: true,
      });
    }
    if (value < 0) {
      ctx.addIssue({
        code: "too_small",
        type: "number",
        minimum: 0,
        inclusive: true,
      });
    }
  });

export const Leasing = z
  .object({
    id: z.string().uuid(),
    userId: User.shape.uuid,
    name: z.string(),
    sellingPrice: z.number().min(0),
    currency: Currencies,
    leasingTime: z.number().min(0),
    paymentFrequency: TimeFrequencies,
    rateValue: z.number().min(0).max(100),
    rateFrequency: TimeFrequencies,
    rateType: InterestRateTypes,
    capitalizationFrequency: TimeFrequencies.optional(),
    buyback: z.boolean(),
    buybackType: NumericalType.optional(),
    buybackValue: z.number().min(0).optional(),
    extras: z.array(LeasingExtras).default([]),
  })
  .superRefine(({ rateType, capitalizationFrequency }, ctx) => {
    if (rateType === "effective") return;
    if (!capitalizationFrequency) {
      ctx.addIssue({
        code: "invalid_type",
        received: "undefined",
        expected: "string",
      });
    }
  })
  .superRefine(({ buyback, buybackType, buybackValue }, ctx) => {
    if (!buyback) return;
    if (!buybackType) {
      ctx.addIssue({
        code: "invalid_type",
        received: "undefined",
        expected: "string",
      });
    }
    const types = Object.values(NumericalType.Values);
    if (buybackType && !types.includes(buybackType)) {
      ctx.addIssue({
        code: "invalid_enum_value",
        received: buybackType,
        options: types,
      });
    }
    if (!buybackValue) {
      ctx.addIssue({
        code: "invalid_type",
        received: "undefined",
        expected: "number",
      });
    }
  });
export type Leasing = z.infer<typeof Leasing>;
