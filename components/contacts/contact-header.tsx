import { ContactAvatar } from "@/components/contacts/avatar";
import { ChannelBadge } from "@/components/contacts/channel-badge";
import type { ContactViewModel } from "@/types/contact";

export function ContactHeader({ contact }: { contact: ContactViewModel }) {
  const canCall = contact.phone.valid && !contact.doNotCall;

  return (
    <header className="rounded-lg border border-border bg-surface p-6">
      {(contact.doNotCall || contact.needsHumanAttention) && (
        <div className="mb-4 space-y-2">
          {contact.doNotCall && (
            <div className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              <strong>No llamar.</strong> {contact.doNotCallReason}
            </div>
          )}
          {contact.needsHumanAttention && (
            <div className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
              <strong>Requiere atención humana.</strong> {contact.handoffReason}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ContactAvatar initials={contact.initials} hasName={contact.hasName} size="lg" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">{contact.displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <ChannelBadge channel={contact.channel} />
              <span>Alta: {contact.createdAt.display}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-sm">
          <span className="font-medium text-foreground">{contact.phone.display}</span>
          {contact.email && <span className="text-muted">{contact.email}</span>}

          {canCall && (
            <div className="flex gap-2">
              <a
                href={contact.phone.callHref ?? undefined}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent/90"
              >
                Llamar
              </a>
              <a
                href={contact.phone.whatsappHref ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-background"
              >
                WhatsApp
              </a>
            </div>
          )}
          {contact.doNotCall && <span className="text-xs font-medium text-danger">Acciones de llamada bloqueadas</span>}
        </div>
      </div>
    </header>
  );
}
