import { createQueryKeys } from "@lukemorales/query-key-factory";

export const leasings = createQueryKeys("leasings", {
  list: null,
  getById: (id: string) => [id],
});
