import type { User } from "@/shared/models/user";

export interface AppEnv {
  users: KVNamespace;
  leasings: KVNamespace;
  uploads: R2Bucket;
  JWT_SECRET: string;
  POSTMARK_SERVER_TOKEN: string;
  POSTMARK_SENDER: string;
}

export interface AppData extends Record<string, unknown> {
  user: User;
}

export type AppFunction<Params extends string = string, Data extends AppData = AppData> = PagesFunction<
  AppEnv,
  Params,
  Data
>;
export type AppContext<Params extends string = string, Data extends AppData = AppData> = EventContext<
  AppEnv,
  Params,
  Data
>;
