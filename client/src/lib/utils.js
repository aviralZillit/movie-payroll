import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TERRITORY_CURRENCY = {
  UK: { currency: "GBP", locale: "en-GB" },
  US: { currency: "USD", locale: "en-US" },
  CA: { currency: "CAD", locale: "en-CA" },
  AU: { currency: "AUD", locale: "en-AU" },
  NZ: { currency: "NZD", locale: "en-NZ" },
  IE: { currency: "EUR", locale: "en-IE" },
  DE: { currency: "EUR", locale: "de-DE" },
  FR: { currency: "EUR", locale: "fr-FR" },
  IT: { currency: "EUR", locale: "it-IT" },
  ES: { currency: "EUR", locale: "es-ES" },
  BE: { currency: "EUR", locale: "fr-BE" },
  NO: { currency: "NOK", locale: "nb-NO" },
  SE: { currency: "SEK", locale: "sv-SE" },
  IN: { currency: "INR", locale: "en-IN" },
  JP: { currency: "JPY", locale: "ja-JP" },
  KR: { currency: "KRW", locale: "ko-KR" },
  SG: { currency: "SGD", locale: "en-SG" },
  AE: { currency: "AED", locale: "en-AE" },
  ZA: { currency: "ZAR", locale: "en-ZA" },
  MX: { currency: "MXN", locale: "es-MX" },
};

function getTerritoryConfig(country) {
  if (country && TERRITORY_CURRENCY[country]) return TERRITORY_CURRENCY[country];
  // When no territory is known, use USD as a neutral international default
  return TERRITORY_CURRENCY.US;
}

export function formatCurrency(amount, country) {
  const { currency, locale } = getTerritoryConfig(country);
  if (amount == null) {
    return new Intl.NumberFormat(locale, {
      style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(0);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

export function currencySymbol(country) {
  const { currency, locale } = getTerritoryConfig(country);
  return new Intl.NumberFormat(locale, { style: "currency", currency })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value || "$";
}

export function getLocale(country) {
  return getTerritoryConfig(country).locale;
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
