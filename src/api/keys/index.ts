import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { leasings } from "./leasings";
import { users } from "./users";

export const queries = mergeQueryKeys(users, leasings);
