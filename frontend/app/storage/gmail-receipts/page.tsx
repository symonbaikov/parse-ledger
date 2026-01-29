'use client';

import React, { useState, useEffect } from 'react';
import { useIntlayer } from 'next-intlayer';
import toast from 'react-hot-toast';
import { gmailReceiptsApi } from '@/app/lib/api';
import { Check, X, Eye, RefreshCw, Download, Filter, Search } from 'lucide-react';
import { ReceiptDetailDrawer } from './components/ReceiptDetailDrawer';
import { BulkActionsBar } from './components/BulkActionsBar';

interface Receipt {
  id: string;
  subject: string;
  sender: string;
  receivedAt: string;
  status: string;
  parsedData?: {
    amount?: number;
    currency?: string;
    vendor?: string;
    date?: string;
    tax?: number;
    category?: string;
    confidence?: number;
  };
  isDuplicate: boolean;
  metadata?: {
    potentialDuplicates?: string[];
  };
}

export default function GmailReceiptsPage() {
  const content = useIntlayer('gmail-receipts-page');

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approvedThisMonth: 0,
    totalAmount: 0,
  });

  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    total: 0,
  });

  useEffect(() => {
    loadStatus();
    loadReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [receipts, selectedStatus, searchQuery]);

  const loadStatus = async () => {
    try {
      const response = await gmailReceiptsApi.getStatus();
      setConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to load Gmail status', error);
    }
  };

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await gmailReceiptsApi.listReceipts({
        limit: pagination.limit,
        offset: pagination.offset,
      });

      setReceipts(response.data.receipts);
      setPagination(prev => ({ ...prev, total: response.data.total }));

      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const pending = response.data.receipts.filter(
        (r: Receipt) => ['new', 'parsed', 'needs_review', 'draft'].includes(r.status)
      ).length;

      const approvedThisMonth = response.data.receipts.filter((r: Receipt) => {
        if (r.status !== 'approved') return false;
        const date = new Date(r.receivedAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      }).length;

      const totalAmount = response.data.receipts.reduce(
        (sum: number, r: Receipt) => sum + (r.parsedData?.amount || 0),
        0
      );

      setStats({
        total: response.data.total,
        pending,
        approvedThisMonth,
        totalAmount,
      });
    } catch (error) {
      console.error('Failed to load receipts', error);
      toast.error(content.toast.error.value);
    } finally {
      setLoading(false);
    }
  };

  const filterReceipts = () => {
    let filtered = receipts;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.parsedData?.vendor?.toLowerCase().includes(query) ||
        r.parsedData?.amount?.toString().includes(query) ||
        r.sender.toLowerCase().includes(query)
      );
    }

    setFilteredReceipts(filtered);
  };

  const handleSelectReceipt = (id: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReceipts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReceipts.size === filteredReceipts.length) {
      setSelectedReceipts(new Set());
    } else {
      setSelectedReceipts(new Set(filteredReceipts.map(r => r.id)));
    }
  };

  const handleBulkApprove = async (categoryId?: string) => {
    try {
      const receiptIds = Array.from(selectedReceipts);
      await gmailReceiptsApi.bulkApproveReceipts(receiptIds, categoryId);
      toast.success(content.toast.bulkApproveSuccess.value);
      setSelectedReceipts(new Set());
      loadReceipts();
    } catch (error) {
      console.error('Failed to bulk approve', error);
      toast.error(content.toast.error.value);
    }
  };

  const handleExportToSheets = async () => {
    try {
      const receiptIds = Array.from(selectedReceipts);
      const response = await gmailReceiptsApi.exportReceiptsToSheets(receiptIds);
      toast.success(content.toast.exportSuccess.value);
      window.open(response.data.url, '_blank');
    } catch (error) {
      console.error('Failed to export', error);
      toast.error(content.toast.error.value);
    }
  };

  const handleApprove = async (receipt: Receipt) => {
    try {
      await gmailReceiptsApi.approveReceipt(receipt.id, {
        description: receipt.parsedData?.vendor || receipt.subject,
        amount: receipt.parsedData?.amount || 0,
        currency: receipt.parsedData?.currency || 'KZT',
        date: receipt.parsedData?.date || receipt.receivedAt,
      });
      toast.success(content.toast.receiptApproved.value);
      loadReceipts();
    } catch (error) {
      console.error('Failed to approve receipt', error);
      toast.error(content.toast.error.value);
    }
  };

  const handleReject = async (receipt: Receipt) => {
    try {
      await gmailReceiptsApi.updateReceipt(receipt.id, { status: 'rejected' });
      toast.success(content.toast.receiptUpdated.value);
      loadReceipts();
    } catch (error) {
      console.error('Failed to reject receipt', error);
      toast.error(content.toast.error.value);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      parsed: 'bg-green-100 text-green-800',
      needs_review: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: content.filters.new.value,
      parsed: content.filters.parsed.value,
      needs_review: content.filters.needsReview.value,
      draft: content.filters.draft.value,
      approved: content.filters.approved.value,
      rejected: content.filters.rejected.value,
      failed: content.filters.failed.value,
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{content.title.value}</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {connected ? content.connectionStatus.connected.value : content.connectionStatus.disconnected.value}
          </div>
        </div>
        <p className="text-gray-600">{content.subtitle.value}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">{content.stats.total.value}</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">{content.stats.pending.value}</div>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">{content.stats.approved.value}</div>
          <div className="text-2xl font-bold">{stats.approvedThisMonth}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">{content.stats.totalAmount.value}</div>
          <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} KZT</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{content.filters.all.value}</option>
              <option value="new">{content.filters.new.value}</option>
              <option value="parsed">{content.filters.parsed.value}</option>
              <option value="needs_review">{content.filters.needsReview.value}</option>
              <option value="draft">{content.filters.draft.value}</option>
              <option value="approved">{content.filters.approved.value}</option>
              <option value="rejected">{content.filters.rejected.value}</option>
              <option value="failed">{content.filters.failed.value}</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={content.filters.searchPlaceholder.value}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadReceipts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {content.actions.refresh.value}
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedReceipts.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedReceipts.size}
          onClear={() => setSelectedReceipts(new Set())}
          onBulkApprove={handleBulkApprove}
          onExportToSheets={handleExportToSheets}
        />
      )}

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedReceipts.size === filteredReceipts.length && filteredReceipts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.date.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.merchant.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.amount.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.tax.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.category.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.status.value}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{content.table.actions.value}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  {content.table.emptyState.value}
                </td>
              </tr>
            ) : (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.has(receipt.id)}
                      onChange={() => handleSelectReceipt(receipt.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(receipt.parsedData?.date || receipt.receivedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {receipt.parsedData?.vendor || receipt.sender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {receipt.parsedData?.amount?.toLocaleString() || '-'} {receipt.parsedData?.currency || 'KZT'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {receipt.parsedData?.tax?.toLocaleString() || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {receipt.parsedData?.category || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(receipt.status)}`}>
                      {getStatusLabel(receipt.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReceiptId(receipt.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={content.actions.viewDetails.value}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!['approved', 'rejected'].includes(receipt.status) && (
                        <>
                          <button
                            onClick={() => handleApprove(receipt)}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title={content.actions.approve.value}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(receipt)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title={content.actions.reject.value}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Detail Drawer */}
      {selectedReceiptId && (
        <ReceiptDetailDrawer
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
          onUpdate={loadReceipts}
        />
      )}
    </div>
  );
}
