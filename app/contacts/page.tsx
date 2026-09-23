import { ContactList } from "@/components/contacts/contact-list";
import { getBaseUrl } from "@/lib/contacts/base-url";
import type { ContactListItemViewModel } from "@/types/contact";

export default async function ContactsPage() {
  const res = await fetch(`${getBaseUrl()}/api/contacts`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el listado de contactos");
  const data: { contacts: ContactListItemViewModel[] } = await res.json();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold text-foreground">Contactos</h1>
      <p className="mt-1 text-sm text-muted">{data.contacts.length} contactos</p>
      <ContactList contacts={data.contacts} />
    </main>
  );
}
