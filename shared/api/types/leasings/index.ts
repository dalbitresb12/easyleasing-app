import { z } from "zod";

import { Leasing } from "@/shared/models/leasing";

import { PaginatedResponse } from "../common/paginated-response";

export const ListLeasingsMetadata = Leasing.pick({
  name: true,
});
export type ListLeasingsMetadata = z.infer<typeof ListLeasingsMetadata>;

export const ListLeasingsResponse = PaginatedResponse(
  Leasing.pick({
    id: true,
    name: true,
  }),
);
export type ListLeasingsResponse = z.infer<typeof ListLeasingsResponse>;
