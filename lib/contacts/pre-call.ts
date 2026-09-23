import { formatRelative } from "@/lib/contacts/normalize-date";
import type { InteractionViewModel, PreCallViewModel, QualificationGroupViewModel } from "@/types/contact";

const CURATED_KEYS = ["budget", "bedrooms", "financing", "urgency", "elevator", "orientation", "garage", "terrace"];

/**
 * Deterministic, rules-based "before you call" summary — no LLM. Picks the
 * operation (sale/rental) group, folds the zone into a one-line headline,
 * and surfaces a handful of the remaining facts plus any safety warnings.
 */
export function buildPreCallView(input: {
  displayName: string;
  hasName: boolean;
  qualificationGroups: QualificationGroupViewModel[];
  interactions: InteractionViewModel[];
  doNotCall: boolean;
  doNotCallReason: string | null;
  needsHumanAttention: boolean;
  handoffReason: string | null;
}): PreCallViewModel {
  const operationGroup = input.qualificationGroups.find((g) => g.key === "sale" || g.key === "rental");
  const sharedGroup = input.qualificationGroups.find((g) => g.key === "shared");
  const sparse = !operationGroup && (!sharedGroup || sharedGroup.facts.length === 0);

  const warnings: string[] = [];
  if (input.doNotCall) warnings.push(`No llamar${input.doNotCallReason ? ` — ${input.doNotCallReason}` : ""}`);
  if (input.needsHumanAttention) {
    warnings.push(`Requiere atención humana${input.handoffReason ? ` — ${input.handoffReason}` : ""}`);
  }

  const lastInteraction = [...input.interactions]
    .filter((i) => i.date.date)
    .sort((a, b) => (b.date.date as Date).getTime() - (a.date.date as Date).getTime())[0];
  const lastContact = lastInteraction
    ? { label: `${lastInteraction.channel.label} · ${formatRelative(lastInteraction.date.date as Date)}`, date: lastInteraction.date }
    : null;

  const firstName = input.hasName ? input.displayName.split(" ")[0] : "Este contacto";

  if (sparse) {
    return {
      headline: `Información limitada. Solo tenemos datos de contacto de ${firstName === "Este contacto" ? "esta persona" : firstName}.`,
      facts: [],
      lastContact,
      warnings,
      sparse: true,
    };
  }

  const zoneFact = operationGroup?.facts.find((f) => f.key.toLowerCase().includes("zone"));
  const operationLabel = operationGroup?.key === "sale" ? "comprar" : operationGroup?.key === "rental" ? "alquilar" : null;

  const headline = operationLabel
    ? `${firstName} busca ${operationLabel}${zoneFact ? ` en ${zoneFact.displayValue}` : ""}.`
    : `${firstName} tiene datos registrados, pero sin operación (compra/alquiler) concretada aún.`;

  const factPool = [...(operationGroup?.facts ?? []), ...(sharedGroup?.facts ?? [])].filter(
    (f) => f.key !== zoneFact?.key
  );

  const curated = CURATED_KEYS.map((key) => factPool.find((f) => f.key === key)).filter(
    (f): f is NonNullable<typeof f> => Boolean(f)
  );
  const rest = factPool.filter((f) => !curated.includes(f));

  const facts = [...curated, ...rest].slice(0, 5).map((f) => ({ label: f.label, value: f.displayValue }));

  return { headline, facts, lastContact, warnings, sparse: false };
}
