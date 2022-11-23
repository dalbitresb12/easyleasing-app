export const createUrlFromRequest = (request: Request, pathname?: string, query?: URLSearchParams): string => {
  const url = new URL(request.url);
  url.username = "";
  url.password = "";
  url.hash = "";
  url.pathname = pathname ?? "";
  url.search = query?.toString() ?? "";
  return url.toString();
};
