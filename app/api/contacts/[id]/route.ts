import { NextResponse } from "next/server";
import { getRawContacts } from "@/lib/contacts/data";
import { normalizeContact } from "@/lib/contacts/normalize-contact";

const SIMULATED_LATENCY_MS = 300;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const { contacts } = getRawContacts();
  const raw = contacts.find((c) => c.id === params.id);

  if (!raw) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ contact: normalizeContact(raw) });
}
