import { AppData, AppFunction } from "@/types/appcontext";
import { z } from "zod";

import { HttpError } from "@/shared/api/types";
import { EditableLeasingModel, Leasing, SanitizedLeasing } from "@/shared/models/leasing";

import { parseBody } from "@/utils/model-parser";
import { firstOrValue } from "@/utils/params";

type Params = "id";

type Data = AppData & {
  leasing: z.infer<typeof Leasing>;
  leasingKey: string;
};

type LeasingFunction = AppFunction<Params, Data>;

const leasingHandler: LeasingFunction = async ctx => {
  const key = `${ctx.data.user.uuid}-${firstOrValue(ctx.params.id)}`;
  const result = await ctx.env.leasings.get(key);
  if (!result) {
    throw new HttpError(404, `Unable to find leasing with ID ${ctx.params.id}.`);
  }

  ctx.data.leasing = Leasing.parse(JSON.parse(result));
  ctx.data.leasingKey = key;
  return ctx.next();
};

const getHandler: LeasingFunction = ctx => {
  const leasing = SanitizedLeasing.parse(ctx.data.leasing);
  return Response.json(leasing);
};

const postHandler: LeasingFunction = async ctx => {
  const leasing = ctx.data.leasing;
  const patch = await parseBody(ctx.request, EditableLeasingModel);
  const merged = {
    ...patch,
    id: leasing.id,
    userId: leasing.userId,
    createdAt: leasing.createdAt,
    updatedAt: new Date(),
  };

  await ctx.env.leasings.put(ctx.data.leasingKey, JSON.stringify(merged), {
    metadata: { name: merged.name },
  });

  const sanitized = SanitizedLeasing.parse(merged);
  return Response.json(sanitized);
};

const putHandler: LeasingFunction = postHandler;

const patchHandler: LeasingFunction = async ctx => {
  const leasing = ctx.data.leasing;
  const patch = await parseBody(ctx.request, EditableLeasingModel.partial());
  const merged = { ...leasing, ...patch };

  merged.updatedAt = new Date();

  await ctx.env.leasings.put(ctx.data.leasingKey, JSON.stringify(merged), {
    metadata: { name: merged.name },
  });

  const sanitized = SanitizedLeasing.parse(merged);
  return Response.json(sanitized);
};

const deleteHandler: LeasingFunction = async ctx => {
  await ctx.env.leasings.delete(ctx.data.leasingKey);
  return new Response(null, { status: 204 });
};

export const onRequestGet: LeasingFunction[] = [leasingHandler, getHandler];
export const onRequestPost: LeasingFunction[] = [leasingHandler, postHandler];
export const onRequestPut: LeasingFunction[] = [leasingHandler, putHandler];
export const onRequestPatch: LeasingFunction[] = [leasingHandler, patchHandler];
export const onRequestDelete: LeasingFunction[] = [leasingHandler, deleteHandler];
