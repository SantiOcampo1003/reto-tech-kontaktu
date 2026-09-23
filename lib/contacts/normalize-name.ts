import type { NormalizedPhone } from "@/types/contact";

function isShouty(s: string): boolean {
  return s === s.toUpperCase() && s !== s.toLowerCase();
}

function isAllLower(s: string): boolean {
  return s === s.toLowerCase() && s !== s.toUpperCase();
}

/**
 * Presentation-only case fix for ALL CAPS ("JOSÉ LUIS MARTÍN CABRERA") or
 * all-lowercase ("carmen ruiz") names. Names that are already mixed case
 * are left untouched — we don't try to be smarter than the source data.
 * The original casing from contactos.json is never mutated, only the
 * displayName derived from it.
 */
function toDisplayCase(name: string): string {
  if (!isShouty(name) && !isAllLower(name)) return name;
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toLocaleUpperCase("es-ES") + word.slice(1) : word))
    .join(" ");
}

export function normalizeName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return toDisplayCase(trimmed);
}

/**
 * Identity fallback chain: valid name -> readable phone -> email ->
 * a dignified placeholder. Never surfaces raw null/undefined/"N/A".
 */
export function getDisplayName(
  fullName: string | null | undefined,
  phone: NormalizedPhone,
  email: string | null | undefined
): { displayName: string; hasName: boolean } {
  const name = normalizeName(fullName);
  if (name) return { displayName: name, hasName: true };
  if (phone.valid) return { displayName: phone.display, hasName: false };
  if (email && email.trim()) return { displayName: email.trim(), hasName: false };
  return { displayName: "Contacto sin identificar", hasName: false };
}

export function getInitials(displayName: string, hasName: boolean): string {
  if (!hasName) return "?";
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return initials || "?";
}
