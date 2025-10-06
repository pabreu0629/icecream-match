export function isAdmin(req: Request): boolean {
  const url = new URL(req.url);
  const codeParam = url.searchParams.get("code");
  const cookie = req.headers.get("cookie") || "";
  const cookieMatch = /admin_code=([^;]+)/.exec(cookie);
  const cookieCode = cookieMatch?.[1];
  const valid = (codeParam && codeParam === process.env.ADMIN_ACCESS_CODE) ||
                (cookieCode && cookieCode === process.env.ADMIN_ACCESS_CODE);
  return !!valid;
}
