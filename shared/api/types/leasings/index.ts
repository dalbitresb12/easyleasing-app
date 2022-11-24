import { z } from "zod";

import { LeasingModel } from "@/shared/models/leasing";

import { PaginatedResponse } from "../common/paginated-response";

export const ListLeasingsMetadata = LeasingModel.pick({
  name: true,
  sellingPrice: true,
  createdAt: true,
});
export type ListLeasingsMetadata = z.infer<typeof ListLeasingsMetadata>;

export const ListLeasingsResponse = PaginatedResponse(
  LeasingModel.pick({
    id: true,
    name: true,
    sellingPrice: true,
    currency: true,
    createdAt: true,
  }),
);
export type ListLeasingsResponse = z.infer<typeof ListLeasingsResponse>;
