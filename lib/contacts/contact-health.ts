import type { DataHealthViewModel, NormalizedPhone, QualificationGroupViewModel } from "@/types/contact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Salud del dato" measures how actionable a contact is for an agent right
 * now — not data "quality" in the abstract. Five weighted, transparent
 * criteria (mirrors the categories the CRM already groups facts by):
 *
 *   Identidad (nombre real)                20
 *   Forma de contacto válida (tel/email)    25
 *   Necesidad identificada (compra/alquiler) 25
 *   Zona preferida                          15
 *   Presupuesto                             15
 *                                          ----
 *                                           100
 */
export function computeDataHealth(input: {
  hasName: boolean;
  phone: NormalizedPhone;
  email: string | null;
  qualificationGroups: QualificationGroupViewModel[];
}): DataHealthViewModel {
  const operationGroups = input.qualificationGroups.filter((g) => g.key === "sale" || g.key === "rental");
  const hasOperation = operationGroups.some((g) => g.facts.length > 0);
  const hasZone = operationGroups.some((g) => g.facts.some((f) => f.key.toLowerCase().includes("zone")));
  const hasBudget = operationGroups.some((g) => g.facts.some((f) => f.key.toLowerCase().includes("budget")));
  const hasValidEmail = !!input.email && EMAIL_RE.test(input.email);
  const hasContact = input.phone.valid || hasValidEmail;

  const criteria = [
    { label: "Identidad (nombre)", achieved: input.hasName, weight: 20 },
    { label: "Forma de contacto válida (teléfono o email)", achieved: hasContact, weight: 25 },
    { label: "Necesidad identificada (compra o alquiler)", achieved: hasOperation, weight: 25 },
    { label: "Zona preferida", achieved: hasZone, weight: 15 },
    { label: "Presupuesto", achieved: hasBudget, weight: 15 },
  ];

  const score = criteria.reduce((acc, c) => acc + (c.achieved ? c.weight : 0), 0);
  const missing = criteria.filter((c) => !c.achieved).map((c) => c.label);

  return { score, criteria, missing };
}
