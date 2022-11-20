import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { users } from "./users";

export const queries = mergeQueryKeys(users);
