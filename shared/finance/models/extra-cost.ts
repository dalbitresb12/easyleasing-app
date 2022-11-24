import type { ExpenseType, NumericalType } from "@/shared/models/common";

export interface ExtraCost {
  name: string;
  type: ExpenseType;
  valueType: NumericalType;
  value: number;
}
