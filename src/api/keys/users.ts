import { createQueryKeys } from "@lukemorales/query-key-factory";

export const users = createQueryKeys("users", {
  me: null,
  picture: null,
});
