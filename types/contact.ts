/**
 * Raw shapes as they actually appear in contactos.json.
 * Deliberately loose (string | number, unknown, optional almost everywhere)
 * because the dataset itself is inconsistent — see lib/contacts/normalize-*.
 */

export type RawDate = string | number | null | undefined;

export interface RawQualificationFact {
  value: unknown;
  source?: string;
  confidence?: string;
  updatedAt?: RawDate;
  sourceRef?: string;
}

export type RawQualificationGroup = Record<string, RawQualificationFact>;

export interface RawQualificationPayload {
  qualification?: {
    sale?: RawQualificationGroup;
    rental?: RawQualificationGroup;
    shared?: RawQualificationGroup;
    [otherGroup: string]: RawQualificationGroup | unknown;
  };
  /** Loose top-level facts that live outside `qualification` (e.g. c-008's income_*). */
  [looseKey: string]: unknown;
}

/** qualification_data can be an object, a JSON-encoded string (see c-003), or null. */
export type RawQualificationData = RawQualificationPayload | string | null | undefined;

export interface RawInteraction {
  id: string;
  channel: string;
  direction?: string | null;
  created_at: RawDate;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RawContact {
  id: string;
  organization_id?: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  lead_source: string | null;
  contact_type?: string | null;
  created_at: RawDate;
  ai_handoff?: boolean;
  handoff_reason?: string;
  handoff_requested_at?: RawDate;
  is_test?: boolean;
  assigned_agent_id?: string | null;
  matching_enabled?: boolean;
  tags?: string[] | null;
  notes?: string | null;
  qualification_data?: RawQualificationData;
  interest_preferences?: unknown;
  interactions: RawInteraction[];
}

export interface RawContactsPayload {
  organization: { id: string; name: string };
  exported_at: string;
  contacts: RawContact[];
}

// ---------------------------------------------------------------------------
// View models — what the UI actually consumes. Every field here is safe to
// render directly: no raw nulls, no unnormalized dates/phones/channels.
// ---------------------------------------------------------------------------

export interface NormalizedDate {
  raw: RawDate;
  date: Date | null;
  display: string;
  valid: boolean;
}

export interface NormalizedPhone {
  raw: string | null;
  display: string;
  e164: string | null;
  valid: boolean;
  callHref: string | null;
  whatsappHref: string | null;
}

export type ChannelCanonical =
  | "CALL"
  | "WHATSAPP"
  | "WEB_FORM"
  | "EMAIL"
  | "META_ADS"
  | "IMPORT"
  | "MANUAL"
  | "UNKNOWN";

export interface NormalizedChannel {
  raw: string | null;
  canonical: ChannelCanonical;
  label: string;
}

export type QualificationSourceKind = "human" | "ai" | "import" | "unknown";

export interface QualificationFactViewModel {
  key: string;
  label: string;
  value: unknown;
  displayValue: string;
  sourceKind: QualificationSourceKind;
  sourceLabel: string;
  date: NormalizedDate;
}

export type QualificationGroupKey = "sale" | "rental" | "shared" | "other";

export interface QualificationGroupViewModel {
  key: QualificationGroupKey;
  label: string;
  facts: QualificationFactViewModel[];
}

export type InteractionKind = "call" | "whatsapp" | "form" | "email" | "other";

export interface InteractionViewModel {
  id: string;
  kind: InteractionKind;
  channel: NormalizedChannel;
  direction: "inbound" | "outbound" | "unknown";
  date: NormalizedDate;
  summary: string;
  transcript: string | null;
  durationLabel: string | null;
  formInfo: { formName: string | null; propertyRef: string | null } | null;
}

export interface DataHealthCriterion {
  label: string;
  achieved: boolean;
  weight: number;
}

export interface DataHealthViewModel {
  score: number;
  criteria: DataHealthCriterion[];
  missing: string[];
}

export interface PreCallFact {
  label: string;
  value: string;
}

export interface PreCallViewModel {
  headline: string;
  facts: PreCallFact[];
  lastContact: { label: string; date: NormalizedDate } | null;
  warnings: string[];
  sparse: boolean;
}

export interface ContactViewModel {
  id: string;
  displayName: string;
  hasName: boolean;
  initials: string;
  phone: NormalizedPhone;
  email: string | null;
  channel: NormalizedChannel;
  createdAt: NormalizedDate;
  doNotCall: boolean;
  doNotCallReason: string | null;
  needsHumanAttention: boolean;
  handoffReason: string | null;
  qualificationGroups: QualificationGroupViewModel[];
  interactions: InteractionViewModel[];
  dataHealth: DataHealthViewModel;
  preCall: PreCallViewModel;
}

export interface ContactListItemViewModel {
  id: string;
  displayName: string;
  initials: string;
  hasName: boolean;
  channel: NormalizedChannel;
  lastInteractionAt: NormalizedDate | null;
}
