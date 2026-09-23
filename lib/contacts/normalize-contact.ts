import { computeDataHealth } from "@/lib/contacts/contact-health";
import { normalizeChannel } from "@/lib/contacts/normalize-channel";
import { normalizeDate } from "@/lib/contacts/normalize-date";
import { getDisplayName, getInitials } from "@/lib/contacts/normalize-name";
import { normalizeInteraction } from "@/lib/contacts/normalize-interaction";
import { normalizePhone } from "@/lib/contacts/normalize-phone";
import { buildPreCallView } from "@/lib/contacts/pre-call";
import { normalizeQualification } from "@/lib/contacts/qualification";
import type { ContactListItemViewModel, ContactViewModel, InteractionViewModel, RawContact } from "@/types/contact";

const DO_NOT_CALL_TAG = "no-llamar";

export function normalizeContact(raw: RawContact): ContactViewModel {
  const phone = normalizePhone(raw.phone);
  const { displayName, hasName } = getDisplayName(raw.full_name, phone, raw.email);
  const initials = getInitials(displayName, hasName);
  const channel = normalizeChannel(raw.lead_source);
  const createdAt = normalizeDate(raw.created_at);
  const qualificationGroups = normalizeQualification(raw.qualification_data ?? null);

  const interactions = sortByDateAsc((raw.interactions ?? []).map(normalizeInteraction));

  const doNotCall = Array.isArray(raw.tags) && raw.tags.some((t) => t.toLowerCase().includes(DO_NOT_CALL_TAG));
  const doNotCallReason = doNotCall ? raw.notes?.trim() || "El contacto ha pedido no ser llamado." : null;

  const needsHumanAttention = raw.ai_handoff === true;
  const handoffReason = needsHumanAttention ? raw.handoff_reason?.trim() || null : null;

  const dataHealth = computeDataHealth({ hasName, phone, email: raw.email, qualificationGroups });
  const preCall = buildPreCallView({
    displayName,
    hasName,
    qualificationGroups,
    interactions,
    doNotCall,
    doNotCallReason,
    needsHumanAttention,
    handoffReason,
  });

  return {
    id: raw.id,
    displayName,
    hasName,
    initials,
    phone,
    email: raw.email,
    channel,
    createdAt,
    doNotCall,
    doNotCallReason,
    needsHumanAttention,
    handoffReason,
    qualificationGroups,
    interactions,
    dataHealth,
    preCall,
  };
}

export function normalizeContactListItem(raw: RawContact): ContactListItemViewModel {
  const phone = normalizePhone(raw.phone);
  const { displayName, hasName } = getDisplayName(raw.full_name, phone, raw.email);
  const initials = getInitials(displayName, hasName);
  const channel = normalizeChannel(raw.lead_source);
  const interactions = sortByDateAsc((raw.interactions ?? []).map(normalizeInteraction));
  const last = interactions[interactions.length - 1] ?? null;

  return {
    id: raw.id,
    displayName,
    initials,
    hasName,
    channel,
    lastInteractionAt: last?.date ?? null,
  };
}

function sortByDateAsc(interactions: InteractionViewModel[]): InteractionViewModel[] {
  return [...interactions].sort((a, b) => {
    const aTime = a.date.date?.getTime() ?? 0;
    const bTime = b.date.date?.getTime() ?? 0;
    return aTime - bTime;
  });
}
