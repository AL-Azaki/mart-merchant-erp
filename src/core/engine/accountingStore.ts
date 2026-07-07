// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNTING STORE — Smart Merchant ERP v1.0
// ═══════════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE: A lightweight reactive store (no Redux/Zustand required).
//   - A single source of truth for all journal entries and lines in the UI session.
//   - All modules (Sales, Purchases, Finance) push PostingResults here via addPosting().
//   - FinanceModule and Reports read from this store.
//   - Initialized with MOCK_JOURNAL_ENTRIES + MOCK_JOURNAL_LINES on first load.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import type { JournalEntry, JournalEntryLine } from "@/core/types/finance";
import { MOCK_JOURNAL_ENTRIES, MOCK_JOURNAL_LINES } from "@/core/data/financeMockData";
import type { PostingResult } from "@/core/engine/accountingPostingEngine";

// ─── Internal Module-Level State (singleton) ──────────────────────────────────
let _entries: JournalEntry[] = [...MOCK_JOURNAL_ENTRIES];
let _lines:   JournalEntryLine[] = [...MOCK_JOURNAL_LINES];
let _listeners: Array<() => void> = [];

function _notify() {
  _listeners.forEach(fn => fn());
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Append a PostingResult (entry + lines) to the global store */
export function addPosting(result: PostingResult): void {
  _entries = [result.entry, ..._entries];
  _lines   = [...result.lines, ..._lines];
  MOCK_JOURNAL_ENTRIES.unshift(result.entry);
  MOCK_JOURNAL_LINES.unshift(...result.lines);
  _notify();
}

/** Get all journal entries (read-only snapshot) */
export function getAllEntries(): JournalEntry[] {
  return _entries;
}

/** Get all journal lines (read-only snapshot) */
export function getAllLines(): JournalEntryLine[] {
  return _lines;
}

/** Get lines for a specific journal entry */
export function getLinesForEntry(entryId: string): JournalEntryLine[] {
  return _lines.filter(l => l.journal_entry_id === entryId);
}

/** Get all journal entries linked to a specific reference (e.g. a sales invoice) */
export function getEntriesForReference(referenceId: string): JournalEntry[] {
  return _entries.filter(e => e.reference_id === referenceId);
}

/** Compute running balance for a specific COA account (Trial Balance data) */
export function getAccountBalance(accountId: string): { debit: number; credit: number; net: number } {
  const accountLines = _lines.filter(l => l.chart_of_account_id === accountId);
  const debit  = accountLines.reduce((s, l) => s + (l.base_debit_amount  || 0), 0);
  const credit = accountLines.reduce((s, l) => s + (l.base_credit_amount || 0), 0);
  return { debit, credit, net: debit - credit };
}

/** Get balances for all accounts used in the journal (for Trial Balance) */
export function getTrialBalanceData(): Array<{ accountId: string; debit: number; credit: number }> {
  const accountMap = new Map<string, { debit: number; credit: number }>();
  _lines.forEach(l => {
    const existing = accountMap.get(l.chart_of_account_id) || { debit: 0, credit: 0 };
    accountMap.set(l.chart_of_account_id, {
      debit:  existing.debit  + (l.base_debit_amount  || 0),
      credit: existing.credit + (l.base_credit_amount || 0),
    });
  });
  return Array.from(accountMap.entries()).map(([accountId, bal]) => ({ accountId, ...bal }));
}

/** Compute P&L summary from journal data */
export function getProfitAndLossData(): { revenue: number; expenses: number; netProfit: number } {
  const { MOCK_CHART_OF_ACCOUNTS } = require("@/core/data/financeMockData");
  
  const revenueAccountIds = MOCK_CHART_OF_ACCOUNTS
    .filter((a: any) => a.account_type === "Revenue")
    .map((a: any) => a.id);
  const expenseAccountIds = MOCK_CHART_OF_ACCOUNTS
    .filter((a: any) => a.account_type === "Expense")
    .map((a: any) => a.id);

  let revenue  = 0;
  let expenses = 0;

  _lines.forEach(l => {
    if (revenueAccountIds.includes(l.chart_of_account_id)) {
      revenue += (l.base_credit_amount || 0) - (l.base_debit_amount || 0);
    }
    if (expenseAccountIds.includes(l.chart_of_account_id)) {
      expenses += (l.base_debit_amount || 0) - (l.base_credit_amount || 0);
    }
  });

  return { revenue, expenses, netProfit: revenue - expenses };
}

// ─── React Hook ───────────────────────────────────────────────────────────────

/** React hook to subscribe to the accounting store */
export function useAccountingStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter(l => l !== listener);
    };
  }, []);

  const addPostingCallback = useCallback((result: PostingResult) => {
    addPosting(result);
  }, []);

  return {
    entries:          getAllEntries(),
    lines:            getAllLines(),
    addPosting:       addPostingCallback,
    getAccountBalance,
    getTrialBalanceData,
    getProfitAndLossData,
    getEntriesForReference,
    getLinesForEntry,
  };
}
