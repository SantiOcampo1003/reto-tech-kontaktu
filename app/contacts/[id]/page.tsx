import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactHeader } from "@/components/contacts/contact-header";
import { ContactQualification } from "@/components/contacts/contact-qualification";
import { DataHealth } from "@/components/contacts/data-health";
import { InteractionTimeline } from "@/components/contacts/interaction-timeline";
import { PreCallCard } from "@/components/contacts/pre-call-card";
import { getBaseUrl } from "@/lib/contacts/base-url";
import type { ContactViewModel } from "@/types/contact";

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${getBaseUrl()}/api/contacts/${params.id}`, { cache: "no-store" });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("No se pudo cargar el contacto");

  const { contact }: { contact: ContactViewModel } = await res.json();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/contacts" className="text-sm text-muted hover:text-foreground">
        ← Contactos
      </Link>

      <div className="mt-4 space-y-6">
        <ContactHeader contact={contact} />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PreCallCard preCall={contact.preCall} />
            <ContactQualification groups={contact.qualificationGroups} />
            <InteractionTimeline interactions={contact.interactions} />
          </div>
          <div className="space-y-6">
            <DataHealth health={contact.dataHealth} />
          </div>
        </div>
      </div>
    </main>
  );
}
