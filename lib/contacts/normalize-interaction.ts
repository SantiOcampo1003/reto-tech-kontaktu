import { normalizeChannel } from "@/lib/contacts/normalize-channel";
import { normalizeDate } from "@/lib/contacts/normalize-date";
import type { ChannelCanonical, InteractionKind, InteractionViewModel, RawInteraction } from "@/types/contact";

function channelToKind(canonical: ChannelCanonical): InteractionKind {
  switch (canonical) {
    case "CALL":
      return "call";
    case "WHATSAPP":
      return "whatsapp";
    case "WEB_FORM":
      return "form";
    case "EMAIL":
      return "email";
    default:
      return "other";
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function normalizeInteraction(raw: RawInteraction): InteractionViewModel {
  const channel = normalizeChannel(raw.channel);
  const kind = channelToKind(channel.canonical);
  const direction = raw.direction === "inbound" || raw.direction === "outbound" ? raw.direction : "unknown";
  const date = normalizeDate(raw.created_at);
  const metadata = raw.metadata ?? null;

  const durationSec = typeof metadata?.duration_sec === "number" ? metadata.duration_sec : null;
  const transcript = typeof metadata?.transcript_excerpt === "string" ? metadata.transcript_excerpt : null;
  const formInfo =
    kind === "form"
      ? {
          formName: typeof metadata?.form === "string" ? metadata.form : null,
          propertyRef: typeof metadata?.property_ref === "string" ? metadata.property_ref : null,
        }
      : null;

  return {
    id: raw.id,
    kind,
    channel,
    direction,
    date,
    summary: raw.content?.trim() || "Sin contenido registrado",
    transcript,
    durationLabel: durationSec !== null ? formatDuration(durationSec) : null,
    formInfo,
  };
}
