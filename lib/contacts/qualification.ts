import { normalizeDate, parseDate } from "@/lib/contacts/normalize-date";
import type {
  QualificationFactViewModel,
  QualificationGroupViewModel,
  QualificationSourceKind,
  RawQualificationData,
  RawQualificationFact,
  RawQualificationGroup,
  RawQualificationPayload,
} from "@/types/contact";

/** Labels for the specific keys we actually observed in contactos.json. */
const KNOWN_LABELS: Record<string, string> = {
  zones: "Zonas",
  budget: "Presupuesto",
  bedrooms: "Habitaciones",
  financing: "Financiación",
  terrace: "Terraza",
  has_pets: "Mascotas",
  urgency: "Urgencia",
  floor_pref: "Planta preferida",
  elevator: "Ascensor",
  orientation: "Orientación",
  garage: "Garaje",
  accesibilidad_movilidad_reducida: "Accesibilidad / movilidad reducida",
  net_income: "Ingresos netos",
  income_verified: "Ingresos verificados",
  income_source: "Fuente de los ingresos",
  income_updated_at: "Ingresos actualizados el",
};

/** Fallback for any key we've never seen: "preferred_move_date" -> "Preferred move date". */
export function humanizeKey(key: string): string {
  if (KNOWN_LABELS[key]) return KNOWN_LABELS[key];
  const cleaned = key.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return key;
  return cleaned.charAt(0).toLocaleUpperCase("es-ES") + cleaned.slice(1);
}

/**
 * Renders any value shape found in qualification without crashing:
 * string, number, boolean, array, null/undefined, plain objects, and the
 * {max}/{min}/{min,max} "budget-like" shape used across several facts.
 */
export function formatQualificationValue(value: unknown): string {
  if (value === null || value === undefined) return "Sin especificar";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return new Intl.NumberFormat("es-ES").format(value);
  if (typeof value === "string") return value.trim() || "Sin especificar";

  if (Array.isArray(value)) {
    return value.length ? value.map(formatQualificationValue).join(", ") : "Sin especificar";
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return "Sin especificar";
    if (keys.length === 2 && "min" in obj && "max" in obj) {
      return `Entre ${formatQualificationValue(obj.min)} y ${formatQualificationValue(obj.max)}`;
    }
    if (keys.length === 1 && "max" in obj) return `Hasta ${formatQualificationValue(obj.max)}`;
    if (keys.length === 1 && "min" in obj) return `Desde ${formatQualificationValue(obj.min)}`;
    return keys.map((k) => `${humanizeKey(k)}: ${formatQualificationValue(obj[k])}`).join(" · ");
  }

  return String(value);
}

function resolveQualificationSourceKind(fact: RawQualificationFact): QualificationSourceKind {
  const sourceRef = (fact.sourceRef ?? "").toLowerCase();
  const source = (fact.source ?? "").toLowerCase();
  if (sourceRef.startsWith("import")) return "import";
  if (source === "manual") return "human";
  if (source === "explicit") return "ai";
  return "unknown";
}

function sourceKindLabel(kind: QualificationSourceKind): string {
  switch (kind) {
    case "human":
      return "Editado manualmente";
    case "ai":
      return "Extraído de conversación (IA)";
    case "import":
      return "Importado";
    default:
      return "Origen desconocido";
  }
}

const SOURCE_RANK: Record<QualificationSourceKind, number> = { human: 3, import: 2, ai: 1, unknown: 0 };

/**
 * Manual override wins over AI extraction; among equal-priority candidates,
 * the most recently updated one wins. The dataset never actually carries
 * more than one candidate per key today (no history array), but this keeps
 * the precedence rule real code instead of a comment, for whenever it does.
 */
export function resolveQualificationFact(facts: RawQualificationFact[]): RawQualificationFact | null {
  if (!facts.length) return null;
  return [...facts].sort((a, b) => {
    const rankDiff = SOURCE_RANK[resolveQualificationSourceKind(b)] - SOURCE_RANK[resolveQualificationSourceKind(a)];
    if (rankDiff !== 0) return rankDiff;
    const dateA = parseDate(a.updatedAt)?.getTime() ?? 0;
    const dateB = parseDate(b.updatedAt)?.getTime() ?? 0;
    return dateB - dateA;
  })[0];
}

function isRawQualificationFact(value: unknown): value is RawQualificationFact {
  return typeof value === "object" && value !== null && "value" in value;
}

function buildFact(key: string, fact: RawQualificationFact): QualificationFactViewModel {
  const resolved = resolveQualificationFact([fact]) ?? fact;
  const sourceKind = resolveQualificationSourceKind(resolved);
  return {
    key,
    label: humanizeKey(key),
    value: resolved.value,
    displayValue: formatQualificationValue(resolved.value),
    sourceKind,
    sourceLabel: sourceKindLabel(sourceKind),
    date: normalizeDate(resolved.updatedAt ?? null),
  };
}

function buildFacts(group: RawQualificationGroup): QualificationFactViewModel[] {
  return Object.entries(group)
    .filter(([, fact]) => isRawQualificationFact(fact))
    .map(([key, fact]) => buildFact(key, fact));
}

function parseQualificationPayload(raw: RawQualificationData): RawQualificationPayload | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    // c-003 stores qualification_data as a JSON-encoded string, not an object.
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null ? (parsed as RawQualificationPayload) : null;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") return raw as RawQualificationPayload;
  return null;
}

const KNOWN_GROUPS: { key: "sale" | "rental" | "shared"; label: string }[] = [
  { key: "sale", label: "Compra" },
  { key: "rental", label: "Alquiler" },
  { key: "shared", label: "Comunes" },
];

export function normalizeQualification(raw: RawQualificationData): QualificationGroupViewModel[] {
  const payload = parseQualificationPayload(raw);
  if (!payload) return [];

  const groups: QualificationGroupViewModel[] = [];
  const qualification = (payload.qualification ?? {}) as Record<string, unknown>;

  for (const { key, label } of KNOWN_GROUPS) {
    const groupData = qualification[key];
    if (groupData && typeof groupData === "object") {
      const facts = buildFacts(groupData as RawQualificationGroup);
      if (facts.length) groups.push({ key, label, facts });
    }
  }

  const otherFacts: QualificationFactViewModel[] = [];

  // Any qualification.<group> we don't already know about (schema-light: new
  // operation groups shouldn't break the UI, they just land in "Otros").
  for (const [key, value] of Object.entries(qualification)) {
    if (key === "sale" || key === "rental" || key === "shared" || key === "_meta") continue;
    if (value && typeof value === "object") {
      otherFacts.push(...buildFacts(value as RawQualificationGroup));
    }
  }

  // Loose top-level facts living outside `qualification` itself, e.g. c-008's
  // net_income/income_verified/income_source/income_updated_at.
  for (const [key, value] of Object.entries(payload)) {
    if (key === "qualification") continue;
    if (value === null || value === undefined) continue;
    if (isRawQualificationFact(value)) {
      otherFacts.push(buildFact(key, value));
    } else {
      otherFacts.push(buildFact(key, { value }));
    }
  }

  if (otherFacts.length) groups.push({ key: "other", label: "Otros", facts: otherFacts });

  return groups;
}
