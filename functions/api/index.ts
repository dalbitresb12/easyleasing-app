import type { AppFunction } from "../types/appcontext";

export const onRequest: AppFunction = () => {
  return new Response(null, { status: 200 });
};
