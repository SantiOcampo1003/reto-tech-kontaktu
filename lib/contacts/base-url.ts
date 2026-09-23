import { headers } from "next/headers";

/** Server components need an absolute URL to call our own route handlers. */
export function getBaseUrl(): string {
  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
