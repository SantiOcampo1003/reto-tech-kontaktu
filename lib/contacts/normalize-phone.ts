import type { NormalizedPhone } from "@/types/contact";

const SPANISH_MOBILE = /^[67]\d{8}$/;

const EMPTY: NormalizedPhone = {
  raw: null,
  display: "Sin teléfono",
  e164: null,
  valid: false,
  callHref: null,
  whatsappHref: null,
};

/**
 * The dataset only contains Spanish mobiles, written as "+34 655 12 34 56",
 * "0034612889034", "699112233" (no prefix) or "+34-644-556-677". We default
 * to Spain (+34) when no country code is present — no other country appears
 * in the dataset, so we don't try to guess beyond that.
 */
export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  if (!raw || !raw.trim()) return EMPTY;

  const trimmed = raw.trim();
  let digits = trimmed.replace(/[^\d]/g, "");

  if (!trimmed.startsWith("+") && digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  let national: string;
  let countryCode = "34";

  if (digits.startsWith("34") && digits.length === 11) {
    national = digits.slice(2);
  } else if (digits.length > 9) {
    national = digits.slice(-9);
    countryCode = digits.slice(0, digits.length - 9);
  } else {
    national = digits;
  }

  const valid = SPANISH_MOBILE.test(national);
  const e164 = valid ? `+${countryCode}${national}` : null;
  const display = valid
    ? `+${countryCode} ${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`
    : trimmed;

  return {
    raw: trimmed,
    display,
    e164,
    valid,
    callHref: e164 ? `tel:${e164}` : null,
    whatsappHref: e164 ? `https://wa.me/${e164.replace("+", "")}` : null,
  };
}
