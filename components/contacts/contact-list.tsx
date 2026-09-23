import Link from "next/link";
import { ContactAvatar } from "@/components/contacts/avatar";
import { ChannelBadge } from "@/components/contacts/channel-badge";
import type { ContactListItemViewModel } from "@/types/contact";

export function ContactList({ contacts }: { contacts: ContactListItemViewModel[] }) {
  if (contacts.length === 0) {
    return <p className="mt-6 text-sm text-muted">No hay contactos todavía.</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <Link
            href={`/contacts/${contact.id}`}
            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-background"
          >
            <ContactAvatar initials={contact.initials} hasName={contact.hasName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{contact.displayName}</p>
              <p className="text-xs text-muted">
                {contact.lastInteractionAt?.valid
                  ? `Último contacto: ${contact.lastInteractionAt.display}`
                  : "Sin interacciones"}
              </p>
            </div>
            <ChannelBadge channel={contact.channel} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
