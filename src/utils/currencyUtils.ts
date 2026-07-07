import { Currency } from "@/core/types/finance";

/**
 * Rounds a number to a specific number of decimal places strictly.
 * Uses Number.EPSILON to ensure correct rounding of edge cases (e.g., 1.005).
 */
export function roundTo(amount: number, decimalPlaces: number = 2): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/**
 * Converts a transaction currency amount to the base currency amount.
 * Example: 100 USD (transaction) * 3.75 (exchange rate) = 375 SAR (base).
 * 
 * @param amount - The amount in the transaction currency.
 * @param exchangeRate - The exchange rate (1 Transaction Currency = X Base Currency).
 * @param decimalPlaces - Optional number of decimal places to round to (default 2).
 * @returns The converted amount in the base currency.
 */
export function calculateBaseAmount(
  amount: number,
  exchangeRate: number,
  decimalPlaces: number = 2
): number {
  const baseAmount = amount * exchangeRate;
  return roundTo(baseAmount, decimalPlaces);
}

/**
 * Calculates the transaction amount from a base amount (reverse calculation).
 * Example: 375 SAR (base) / 3.75 (exchange rate) = 100 USD (transaction).
 */
export function calculateTransactionAmount(
  baseAmount: number,
  exchangeRate: number,
  decimalPlaces: number = 2
): number {
  if (exchangeRate === 0) return 0;
  const amount = baseAmount / exchangeRate;
  return roundTo(amount, decimalPlaces);
}

/**
 * Formats an amount with its currency symbol and correct decimal places.
 * Uses Intl.NumberFormat for robust localization.
 * 
 * @param amount - The numerical amount.
 * @param currency - The currency object containing symbol, decimals, and locale info.
 * @param locale - The current UI locale (e.g., "ar-SA" or "en-US").
 */
export function formatCurrency(
  amount: number,
  currency: Pick<Currency, "currency_symbol" | "currency_code" | "decimal_places">,
  locale: string = "ar-SA"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.currency_code,
    minimumFractionDigits: currency.decimal_places ?? 2,
    maximumFractionDigits: currency.decimal_places ?? 2,
  }).format(amount).replace(currency.currency_code, currency.currency_symbol);
}
