'use client';

import { resolveBankLogo } from '@bank-logos';
import { Download, FileText, FileUp, TrendingDown, TrendingUp } from 'lucide-react';
import { useIntlayer, useLocale } from 'next-intlayer';
import React, { useMemo } from 'react';
import type { StatementDetails, Transaction } from './types';

interface SummaryBarProps {
  statement: StatementDetails;
  transactions: Transaction[];
  onExport?: () => void;
  onFixIssues?: () => void;
  onDownload?: () => void;
  fixing?: boolean;
}

const getBankDisplayName = (bankName: string) => {
  const resolved = resolveBankLogo(bankName);
  if (!resolved) return bankName;
  return resolved.key !== 'other' ? resolved.displayName : bankName;
};

/**
 * Summary bar component showing file metadata, parsing status, and financial totals
 */
export default function SummaryBar({
  statement,
  transactions,
  onExport,
  onFixIssues,
  onDownload,
  fixing = false,
}: SummaryBarProps) {
  const { locale } = useLocale();
  const t = useIntlayer('transactionsSummaryBar');

  const stats = useMemo(() => {
    const totalParsed = transactions.length;
    const totalWarnings = transactions.filter(tx => tx.hasWarnings).length;
    const totalErrors = transactions.filter(tx => tx.hasErrors).length;
    const uncategorized = transactions.filter(tx => !tx.category).length;

    // Safely convert debit and credit to numbers, handling string values or NaN
    const debitTotal = transactions.reduce((sum, tx) => {
      const debitValue = Number(tx.debit);
      return sum + (Number.isNaN(debitValue) ? 0 : debitValue);
    }, 0);

    const creditTotal = transactions.reduce((sum, tx) => {
      const creditValue = Number(tx.credit);
      return sum + (Number.isNaN(creditValue) ? 0 : creditValue);
    }, 0);

    const currency = transactions[0]?.currency || 'KZT';

    return {
      totalParsed,
      totalWarnings,
      totalErrors,
      uncategorized,
      debitTotal,
      creditTotal,
      currency,
    };
  }, [transactions]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    );
  };

  const formatAmount = (amount: number, currency: string): string => {
    if (Number.isNaN(amount)) return '—';
    return new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency || 'KZT',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left section: File metadata and parsing status */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">{getBankDisplayName(statement.bankName)}</span>
                {statement.metadata?.accountNumber && (
                  <>
                    <span>•</span>
                    <span>{statement.metadata.accountNumber}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {t.uploadedAt.value}: {formatDate(statement.createdAt)}
              </div>
            </div>
          </div>

          {/* Parsing status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {t.parsed.value}: {stats.totalParsed}
            </div>
            {stats.totalWarnings > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                {t.warnings.value}: {stats.totalWarnings}
              </div>
            )}
            {stats.totalErrors > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                {t.errors.value}: {stats.totalErrors}
              </div>
            )}
            {stats.uncategorized > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {t.uncategorized.value}: {stats.uncategorized}
              </div>
            )}
          </div>
        </div>

        {/* Right section: Financial totals and actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Debit Total */}
            <div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                <TrendingDown className="h-4 w-4" />
                {t.debitTotal.value}
              </div>
              <div className="mt-1 text-lg font-bold text-red-700">
                {formatAmount(stats.debitTotal, stats.currency)}
              </div>
            </div>

            {/* Credit Total */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {t.creditTotal.value}
              </div>
              <div className="mt-1 text-lg font-bold text-emerald-700">
                {formatAmount(stats.creditTotal, stats.currency)}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(stats.totalErrors > 0 || stats.uncategorized > 0) && (
              <button
                type="button"
                onClick={onFixIssues}
                disabled={fixing}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  stats.totalErrors > 0
                    ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                {fixing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label={t.fixIssues.value}
                    >
                      <title>{t.fixIssues.value}</title>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t.fixIssues.value}
                  </>
                ) : stats.totalErrors > 0 ? (
                  `${t.showErrors.value} (${stats.totalErrors})`
                ) : (
                  t.fixIssues.value
                )}
              </button>
            )}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                {t.download?.value || 'Download'}
              </button>
            )}
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FileUp className="h-4 w-4" />
              {t.export.value}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
