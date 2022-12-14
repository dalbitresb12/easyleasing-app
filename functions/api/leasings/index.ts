import { AppFunction } from "@/types/appcontext";
import { v4 as uuidv4 } from "uuid";

import { ListLeasingsMetadata, ListLeasingsResponse } from "@/shared/api/types";
import { getPeriods } from "@/shared/finance/initial-data";
import { EditableLeasingModel, Leasing, SanitizedLeasing } from "@/shared/models/leasing";
import { clamp } from "@/shared/utils/numbers";

import { assertModel, parseBody } from "@/utils/model-parser";
import { createUrlFromRequest } from "@/utils/urls";

export const onRequestGet: AppFunction = async ctx => {
  const url = new URL(ctx.request.url);
  const limit = clamp(Number(url.searchParams.get("limit")) || 10, { min: 1, max: 10 });
  const cursor = url.searchParams.get("cursor");

  const userId = ctx.data.user.uuid;

  const results = await ctx.env.leasings.list<ListLeasingsMetadata>({ prefix: `${userId}-`, limit, cursor });
  const mapped = results.keys.map(item => {
    const { name: key, metadata } = item;
    const id = key.substring(37);
    return { id, ...(metadata || {}) };
  });

  const response = ListLeasingsResponse.parse({
    data: mapped,
    metadata: {
      cursor: results.cursor,
      limit: limit,
      complete: results.list_complete,
    },
  } as ListLeasingsResponse);

  return Response.json(response);
};

export const onRequestPost: AppFunction = async ctx => {
  const req = await parseBody(ctx.request, EditableLeasingModel);

  const userId = ctx.data.user.uuid;

  const now = new Date();
  const leasing = await assertModel(
    {
      ...req,
      id: uuidv4(),
      userId: userId,
      createdAt: now,
      updatedAt: now,
    } as Leasing,
    Leasing,
  );

  if (leasing.gracePeriods.length === 0) {
    const periods = getPeriods(leasing.leasingTime, leasing.paymentFrequency);
    leasing.gracePeriods = Array(periods).fill("no");
  }

  // TODO: Check for duplicate key. Shouldn't happen, but who knows?
  await ctx.env.leasings.put(`${userId}-${leasing.id}`, JSON.stringify(leasing), {
    metadata: {
      name: leasing.name,
      createdAt: leasing.createdAt,
      sellingPrice: leasing.sellingPrice,
      currency: leasing.currency,
    },
  });

  const headers = new Headers();
  const location = createUrlFromRequest(ctx.request, `/api/leasings/${leasing.id}`);
  headers.set("Location", location.toString());
  const response = SanitizedLeasing.parse(leasing);
  return Response.json(response, { status: 201, headers });
};
