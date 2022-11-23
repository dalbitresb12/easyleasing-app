import { RefinementCtx, z } from "zod";

import { Currencies, DateWithParsing, ExpenseType, InterestRateTypes, NumericalType, TimeFrequencies } from "./common";
import { User } from "./user";

type SuperRefineFn<T> = (value: T, ctx: RefinementCtx) => void | unknown;

type Optional<T> = T | undefined;

type MaybeArray<T> = T | T[];

type LeasingExtrasValueValidationParams = {
  valueType: NumericalType;
  value: number;
};
export const leasingExtrasValueValidation: SuperRefineFn<Optional<MaybeArray<LeasingExtrasValueValidationParams>>> = (
  extras,
  ctx,
) => {
  if (typeof extras === "undefined") return;
  if (Array.isArray(extras)) return extras.map(extra => leasingExtrasValueValidation(extra, ctx));
  const { valueType, value } = extras;
  if (valueType === "percent" && value > 100) {
    ctx.addIssue({
      code: "too_big",
      type: "number",
      maximum: 100,
      inclusive: true,
      path: ["value"],
    });
  }
  if (value < 0) {
    ctx.addIssue({
      code: "too_small",
      type: "number",
      minimum: 0,
      inclusive: true,
      path: ["value"],
    });
  }
};

export const LeasingExtrasModel = z.object({
  name: z.string(),
  valueType: NumericalType,
  value: z.number(),
  expenseType: ExpenseType,
});

export const LeasingExtras = LeasingExtrasModel.superRefine(leasingExtrasValueValidation);
export type LeasingExtras = z.infer<typeof LeasingExtrasModel>;

type LeasingRateTypeValidationParams = {
  rateType?: InterestRateTypes;
  capitalizationFrequency?: TimeFrequencies;
};
export const leasingRateTypeValidation: SuperRefineFn<LeasingRateTypeValidationParams> = (
  { rateType, capitalizationFrequency },
  ctx,
) => {
  if (!rateType) return;
  if (rateType === "effective" && capitalizationFrequency) {
    ctx.addIssue({
      code: "invalid_type",
      received: "string",
      expected: "undefined",
      path: ["capitalizationFrequency"],
    });
  } else if (rateType === "nominal" && !capitalizationFrequency) {
    ctx.addIssue({
      code: "invalid_type",
      received: "undefined",
      expected: "string",
      path: ["capitalizationFrequency"],
    });
  }
};

type LeasingBuybackValidationParams = {
  buyback?: boolean;
  buybackType?: NumericalType;
  buybackValue?: number;
};
export const leasingBuybackValidation: SuperRefineFn<LeasingBuybackValidationParams> = (
  { buyback, buybackType, buybackValue },
  ctx,
) => {
  if (typeof buyback === "undefined") return;
  const types = Object.values(NumericalType.Values);
  if (buyback && !buybackType) {
    ctx.addIssue({
      code: "invalid_type",
      received: "undefined",
      expected: "string",
      path: ["buybackType"],
    });
  } else if (buyback && buybackType && !types.includes(buybackType)) {
    ctx.addIssue({
      code: "invalid_enum_value",
      received: buybackType,
      options: types,
      path: ["buybackType"],
    });
  }
  if (buyback && !buybackValue) {
    ctx.addIssue({
      code: "invalid_type",
      received: "undefined",
      expected: "number",
      path: ["buybackValue"],
    });
  } else if (buyback && buybackType === "percent" && buybackValue && buybackValue > 100) {
    ctx.addIssue({
      code: "too_big",
      type: "number",
      maximum: 100,
      inclusive: true,
      path: ["buybackValue"],
    });
  }
  if (!buyback && buybackType) {
    ctx.addIssue({
      code: "invalid_type",
      received: "string",
      expected: "undefined",
      path: ["buybackType"],
    });
  }
  if (!buyback && buybackValue) {
    ctx.addIssue({
      code: "invalid_type",
      received: "number",
      expected: "undefined",
      path: ["buybackType"],
    });
  }
};

export const LeasingModel = z.object({
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
  extras: z.array(LeasingExtrasModel).default([]),
  createdAt: DateWithParsing,
  updatedAt: DateWithParsing,
});

export const Leasing = LeasingModel.superRefine(leasingRateTypeValidation)
  .superRefine(leasingBuybackValidation)
  .superRefine(({ extras }, ctx) => leasingExtrasValueValidation(extras, ctx));
export type Leasing = z.infer<typeof LeasingModel>;

export const SanitizedLeasing = Leasing;
export type SanitizedLeasing = z.infer<typeof SanitizedLeasing>;

export const EditableLeasingModel = LeasingModel.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export const EditableLeasing = EditableLeasingModel.superRefine(leasingRateTypeValidation)
  .superRefine(leasingBuybackValidation)
  .superRefine(({ extras }, ctx) => leasingExtrasValueValidation(extras, ctx));
export type EditableLeasing = z.infer<typeof EditableLeasingModel>;

export const PartialEditableLeasing = EditableLeasingModel.partial()
  .superRefine(leasingRateTypeValidation)
  .superRefine(leasingBuybackValidation)
  .superRefine(({ extras }, ctx) => leasingExtrasValueValidation(extras, ctx));
export type PartialEditableLeasing = z.infer<typeof PartialEditableLeasing>;
