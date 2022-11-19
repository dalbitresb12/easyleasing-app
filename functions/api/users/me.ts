import { SanitizedUser } from "../../models/user";
import { AppFunction } from "../../types/appcontext";

export const onRequestGet: AppFunction = ctx => Response.json(SanitizedUser.parse(ctx.data.user));
