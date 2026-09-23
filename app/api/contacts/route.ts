import { NextResponse } from "next/server";
import { getRawContacts } from "@/lib/contacts/data";
import { normalizeContactListItem } from "@/lib/contacts/normalize-contact";

const SIMULATED_LATENCY_MS = 300;

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const { contacts } = getRawContacts();
  return NextResponse.json({ contacts: contacts.map(normalizeContactListItem) });
}
