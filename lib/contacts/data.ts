import fs from "node:fs";
import path from "node:path";
import type { RawContactsPayload } from "@/types/contact";

let cached: RawContactsPayload | null = null;

/** Reads contactos.json once per server process. This stands in for a real datastore. */
export function getRawContacts(): RawContactsPayload {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "contactos.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  cached = JSON.parse(raw) as RawContactsPayload;
  return cached;
}
