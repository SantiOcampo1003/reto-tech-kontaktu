import type { NormalizedDate, RawDate } from "@/types/contact";

const DATE_DISPLAY = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATE_TIME_DISPLAY = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DD_MM_YYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/;

/**
 * Parses the date formats actually found in contactos.json:
 * ISO 8601, "DD/MM/YYYY" (+ optional " HH:mm"), and unix timestamps
 * (as bare numbers, in seconds — e.g. c-012's created_at).
 * Returns null instead of throwing/NaN when the value can't be trusted.
 */
export function parseDate(raw: RawDate): Date | null {
  if (raw === null || raw === undefined || raw === "") return null;

  if (typeof raw === "number") {
    const ms = raw < 1e12 ? raw * 1000 : raw;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = raw.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = trimmed.match(DD_MM_YYYY);
  if (match) {
    const [, dd, mm, yyyy, hh, min] = match;
    const date = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      hh ? Number(hh) : 0,
      min ? Number(min) : 0
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function normalizeDate(raw: RawDate): NormalizedDate {
  const date = parseDate(raw);
  if (!date) {
    return { raw: raw ?? null, date: null, display: "Fecha no disponible", valid: false };
  }
  return { raw: raw ?? null, date, display: DATE_DISPLAY.format(date), valid: true };
}

export function formatDateTime(date: Date): string {
  return DATE_TIME_DISPLAY.format(date);
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffSec = Math.round((now.getTime() - date.getTime()) / 1000);
  const abs = Math.abs(diffSec);

  let value: number;
  let unit: string;
  if (abs < MINUTE) {
    value = abs;
    unit = "segundo";
  } else if (abs < HOUR) {
    value = Math.floor(abs / MINUTE);
    unit = "minuto";
  } else if (abs < DAY) {
    value = Math.floor(abs / HOUR);
    unit = "hora";
  } else if (abs < MONTH) {
    value = Math.floor(abs / DAY);
    unit = "día";
  } else if (abs < YEAR) {
    value = Math.floor(abs / MONTH);
    unit = "mes";
  } else {
    value = Math.floor(abs / YEAR);
    unit = "año";
  }

  const plural = value === 1 ? unit : unit === "mes" ? "meses" : `${unit}s`;
  return diffSec >= 0 ? `hace ${value} ${plural}` : `en ${value} ${plural}`;
}
