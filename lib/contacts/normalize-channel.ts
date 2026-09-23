import type { ChannelCanonical, NormalizedChannel } from "@/types/contact";

/**
 * lead_source and interaction.channel encode the same concepts with
 * different vocabularies across the dataset (VOICE_CALL / llamada / VOZ,
 * WHATSAPP / whatsapp, WITEI / CRM as legacy import sources, ...).
 * This is the single place that maps every raw spelling we've observed
 * to a canonical value the UI can rely on.
 */
const ALIASES: Record<string, ChannelCanonical> = {
  voice_call: "CALL",
  voice: "CALL",
  call: "CALL",
  llamada: "CALL",
  voz: "CALL",
  whatsapp: "WHATSAPP",
  website: "WEB_FORM",
  web_form: "WEB_FORM",
  form: "WEB_FORM",
  email: "EMAIL",
  meta_lead_ads: "META_ADS",
  meta: "META_ADS",
  meta_ads: "META_ADS",
  witei: "IMPORT",
  crm: "IMPORT",
  manual: "MANUAL",
};

const LABELS: Record<ChannelCanonical, string> = {
  CALL: "Llamada",
  WHATSAPP: "WhatsApp",
  WEB_FORM: "Formulario web",
  EMAIL: "Email",
  META_ADS: "Meta Ads",
  IMPORT: "Importado",
  MANUAL: "Manual",
  UNKNOWN: "Origen desconocido",
};

export function normalizeChannel(raw: string | null | undefined): NormalizedChannel {
  const key = (raw ?? "").trim().toLowerCase();
  const canonical = ALIASES[key] ?? "UNKNOWN";
  return { raw: raw ?? null, canonical, label: LABELS[canonical] };
}
