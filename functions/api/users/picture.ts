import type { AppFunction } from "../../types/appcontext";
import { v4 as uuidv4 } from "uuid";
import { HttpError, ServerError } from "../../types/httperror";

type BytesRange = {
  offset: number;
  end: number;
  length: number;
};

const parseRange = (encoded: string | null): BytesRange | undefined => {
  if (encoded === null) {
    return;
  }

  const parts = encoded.split("bytes=")[1]?.split("-") ?? [];
  if (parts.length !== 2) {
    throw new HttpError(400, "Not supported to skip specifying the beginning/ending byte at this time.");
  }

  return {
    offset: Number(parts[0]),
    end: Number(parts[1]),
    length: Number(parts[1]) + 1 - Number(parts[0]),
  };
};

export const onRequestHead: AppFunction = async ctx => {
  const picture = ctx.data.user.profilePicture;
  if (!picture) {
    return new Response(null, { status: 404 });
  }

  const upload = await ctx.env.easyleasinguploads.head(picture);
  if (!upload) {
    return new Response(null, { status: 404 });
  }

  const headers = new Headers();
  upload.writeHttpMetadata(headers);
  headers.set("etag", upload.httpEtag);
  return new Response(null, { headers });
};

export const onRequestGet: AppFunction = async ctx => {
  const picture = ctx.data.user.profilePicture;
  if (!picture) {
    return new Response(null, { status: 404 });
  }

  const range = parseRange(ctx.request.headers.get("range"));
  const upload = await ctx.env.easyleasinguploads.get(picture, { range, onlyIf: ctx.request.headers });
  if (!upload) {
    return new Response(null, { status: 404 });
  }

  const headers = new Headers();
  upload.writeHttpMetadata(headers);
  headers.set("etag", upload.httpEtag);
  if (range) {
    headers.set("content-range", `bytes ${range.offset}-${range.end}/${upload.size}`);
  }
  if ("body" in upload) {
    const status = range ? 206 : 200;
    return new Response(upload.body, { headers, status });
  }
  return new Response(null, { headers, status: 304 });
};

export const onRequestPut: AppFunction = async ctx => {
  const size = Number(ctx.request.headers.get("content-length") || 0);
  if (size === 0) {
    throw new HttpError(422, "Content-Length header not found.");
  }
  // Max size of 1MB
  if (size > 1000000) {
    throw new HttpError(413, "The uploaded image is too big.");
  }

  const type = ctx.request.headers.get("content-type");
  if (!type || !type.startsWith("image/")) {
    throw new HttpError(400, "An invalid file was uploaded.");
  }

  const uploadId = uuidv4();
  const previousPicture = ctx.data.user.profilePicture;

  const duplicateUpload = await ctx.env.easyleasinguploads.head(uploadId);
  if (duplicateUpload) {
    throw new ServerError("Another upload already exists with the same UUID.", {
      user: ctx.data.user.email,
      uuid: uploadId,
    });
  }

  const upload = await ctx.env.easyleasinguploads.put(uploadId, ctx.request.body, {
    httpMetadata: ctx.request.headers,
  });

  ctx.data.user.profilePicture = uploadId;
  await ctx.env.users.put(ctx.data.user.email, JSON.stringify(ctx.data.user));

  if (previousPicture) {
    await ctx.env.easyleasinguploads.delete(previousPicture);
  }

  const headers = new Headers();
  headers.set("etag", upload.httpEtag);
  return new Response(null, { headers });
};

export const onRequestDelete: AppFunction = async ctx => {
  const picture = ctx.data.user.profilePicture;
  if (!picture) {
    return new Response(null, { status: 404 });
  }

  await ctx.env.easyleasinguploads.delete(picture);

  delete ctx.data.user.profilePicture;
  await ctx.env.users.put(ctx.data.user.email, JSON.stringify(ctx.data.user));

  return new Response(null, { status: 204 });
};
