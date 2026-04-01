import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, country) {
  const isUS = country === "US";
  const fallback = isUS ? "$0.00" : "£0.00";
  if (amount == null) return fallback;
  return new Intl.NumberFormat(isUS ? "en-US" : "en-GB", {
    style: "currency",
    currency: isUS ? "USD" : "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function currencySymbol(country) {
  return country === "US" ? "$" : "£";
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
