import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CURRENCY_MAP = {
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
  CA: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  AU: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  NZ: { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  FR: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  DE: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  ES: { code: 'EUR', symbol: '€', locale: 'es-ES' },
  IE: { code: 'EUR', symbol: '€', locale: 'en-IE' },
  IT: { code: 'EUR', symbol: '€', locale: 'it-IT' },
  JP: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  KR: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  IN: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  SG: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
};
const DEFAULT_CURRENCY = { code: 'GBP', symbol: '£', locale: 'en-GB' };

export function formatCurrency(amount, country) {
  const c = CURRENCY_MAP[country] || DEFAULT_CURRENCY;
  if (amount == null) return `${c.symbol}0.00`;
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function currencySymbol(country) {
  return (CURRENCY_MAP[country] || DEFAULT_CURRENCY).symbol;
}

export function formatDate(date) {
  if (!date) return "";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "dd MMM yyyy");
}

export function formatTime(date) {
  if (!date) return "";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "HH:mm");
}
