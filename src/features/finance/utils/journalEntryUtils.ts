import type { JournalEntryLine } from "@/core/types/finance";
import { calculateBaseAmount, roundTo } from "@/utils/currencyUtils";
import { v4 as uuidv4 } from "uuid"; // assuming uuid is installed, or we can just use generic id generator

export interface JournalLineInput {
  chart_of_account_id: string;
  debit_amount: number;
  credit_amount: number;
  exchange_rate: number;
  description?: string;
}

/**
 * Builds balanced journal entry lines.
 * Calculates base amounts and automatically injects an FX Gain/Loss line
 * if there's a discrepancy in base currency totals due to exchange rates.
 * 
 * @param lines - Array of proposed journal entry lines in their transaction currencies.
 * @param journalEntryId - The ID of the Journal Entry header.
 * @param fxGainLossAccountId - The ID of the generic FX Gain/Loss account in the Chart of Accounts.
 * @returns Array of fully balanced JournalEntryLines (including base amounts).
 */
export function buildBalancedJournalLines(
  lines: JournalLineInput[],
  journalEntryId: string,
  fxGainLossAccountId: string
): JournalEntryLine[] {
  let totalBaseDebit = 0;
  let totalBaseCredit = 0;

  const resultLines: JournalEntryLine[] = lines.map((line, index) => {
    // 1. Calculate Base amounts
    const baseDebit = calculateBaseAmount(line.debit_amount, line.exchange_rate);
    const baseCredit = calculateBaseAmount(line.credit_amount, line.exchange_rate);

    totalBaseDebit += baseDebit;
    totalBaseCredit += baseCredit;

    // 2. Map to output type
    return {
      id: crypto.randomUUID(),
      journal_entry_id: journalEntryId,
      chart_of_account_id: line.chart_of_account_id,
      line_number: index + 1,
      debit_amount: line.debit_amount,
      credit_amount: line.credit_amount,
      base_debit_amount: baseDebit,
      base_credit_amount: baseCredit,
      description: line.description || null,
    };
  });

  // 3. Round total bases to prevent trailing precision errors
  totalBaseDebit = roundTo(totalBaseDebit, 2);
  totalBaseCredit = roundTo(totalBaseCredit, 2);

  // 4. Check for imbalance in the base currency (FX difference)
  const difference = roundTo(totalBaseDebit - totalBaseCredit, 2);

  if (difference !== 0) {
    const isGain = difference > 0; 
    // If Debit > Credit, we need to add to Credit to balance (Gain)
    // If Credit > Debit, we need to add to Debit to balance (Loss)
    
    resultLines.push({
      id: crypto.randomUUID(),
      journal_entry_id: journalEntryId,
      chart_of_account_id: fxGainLossAccountId,
      line_number: resultLines.length + 1,
      // The FX line itself is recorded strictly in base currency,
      // so original debit/credit is 0, base debit/credit takes the difference.
      debit_amount: 0,
      credit_amount: 0,
      base_debit_amount: isGain ? 0 : Math.abs(difference),
      base_credit_amount: isGain ? difference : 0,
      description: "فروق أسعار صرف العملات (FX Gain/Loss)",
    });
  }

  return resultLines;
}
