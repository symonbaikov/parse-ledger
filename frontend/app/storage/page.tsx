'use client';

import { resolveBankLogo } from '@bank-logos';
import {
  Download,
  Eye,
  Filter,
  MoreVertical,
  Search,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { useIntlayer, useLocale } from 'next-intlayer';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BankLogoAvatar } from '../components/BankLogoAvatar';
import { DocumentTypeIcon } from '../components/DocumentTypeIcon';
import api from '../lib/api';

type FileAvailabilityStatus = 'both' | 'disk' | 'db' | 'missing';

type FileAvailability = {
  onDisk: boolean;
  inDb: boolean;
  status: FileAvailabilityStatus;
};

interface StorageFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  bankName: string;
  status: string;
  createdAt: string;
  isOwner: boolean;
  permissionType?: string;
  canReshare: boolean;
  sharedLinksCount: number;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  metadata?: {
    accountNumber?: string;
    periodStart?: string;
    periodEnd?: string;
  };
  fileAvailability?: FileAvailability;
}

interface CategoryOption {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

const getBankDisplayName = (bankName: string) => {
  const resolved = resolveBankLogo(bankName);
  if (!resolved) return bankName;
  return resolved.key !== 'other' ? resolved.displayName : bankName;
};

const getAvailabilityColor = (status: FileAvailabilityStatus) => {
  switch (status) {
    case 'both':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'missing':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

const getAvailabilityDot = (status: FileAvailabilityStatus) => {
  switch (status) {
    case 'both':
      return 'bg-green-500';
    case 'missing':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
};

const getStatusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'parsed') return 'success';
  if (normalized === 'processing' || normalized === 'uploaded') return 'warning';
  if (normalized === 'error') return 'error';
  return 'default';
};

/**
 * Storage page - displays all files with sharing and permissions
 */
export default function StoragePage() {
  const router = useRouter();
  const t = useIntlayer('storagePage');
  const { locale } = useLocale();
  const PAGE_SIZE = 20;
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    bank: '',
    categoryId: '',
    ownership: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFiles();
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        filterOpen &&
        !filterPanelRef.current?.contains(target) &&
        !filterButtonRef.current?.contains(target)
      ) {
        setFilterOpen(false);
      }
      if (openMenuId && !actionMenuRef.current?.contains(target)) {
        setOpenMenuId(null);
        setSelectedFile(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen, openMenuId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/storage/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error(t.toasts.loadFilesFailed.value);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error(t.toasts.loadCategoriesFailed.value);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleView = (fileId: string) => {
    router.push(`/storage/${fileId}`);
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/storage/files/${fileId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t.toasts.downloaded.value);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error(t.toasts.downloadFailed.value);
    }
  };

  const handleShare = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=share`);
    toast.success(t.toasts.shareOpened.value);
  };

  const handleManagePermissions = (fileId: string) => {
    router.push(`/storage/${fileId}?tab=permissions`);
    toast.success(t.toasts.permissionsOpened.value);
  };

  const handleCategoryChange = async (fileId: string, categoryId: string) => {
    try {
      const response = await api.patch(`/storage/files/${fileId}/category`, {
        categoryId: categoryId || null,
      });

      setFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? {
                ...file,
                categoryId: response.data?.categoryId ?? null,
                category: response.data?.category ?? null,
              }
            : file,
        ),
      );
      toast.success(t.toasts.categoryUpdated.value);
    } catch (error) {
      console.error('Failed to update file category:', error);
      toast.error(t.toasts.categoryUpdateFailed.value);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return t.statusLabels.completed.value;
      case 'processing':
        return t.statusLabels.processing.value;
      case 'error':
        return t.statusLabels.error.value;
      case 'uploaded':
        return t.statusLabels.uploaded.value;
      case 'parsed':
        return t.statusLabels.parsed.value;
      default:
        return status;
    }
  };

  const getPermissionLabel = (permission?: string | null) => {
    switch ((permission || '').toLowerCase()) {
      case 'owner':
        return t.permission.owner.value;
      case 'editor':
        return t.permission.editor.value;
      case 'viewer':
        return t.permission.viewer.value;
      case 'downloader':
        return t.permission.downloader.value;
      default:
        return t.permission.access.value;
    }
  };

  const bankOptions = useMemo(
    () => Array.from(new Set(files.map(f => f.bankName).filter(Boolean))),
    [files],
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(files.map(f => f.status).filter(Boolean))),
    [files],
  );

  const getAvailabilityLabel = (status: FileAvailabilityStatus) => {
    switch (status) {
      case 'both':
        return t.availability.labels.both;
      case 'disk':
        return t.availability.labels.disk;
      case 'db':
        return t.availability.labels.db;
      case 'missing':
        return t.availability.labels.missing;
      default:
        return status;
    }
  };

  const getAvailabilityTooltip = (status: FileAvailabilityStatus) => {
    switch (status) {
      case 'both':
        return t.availability.tooltips.both.value;
      case 'disk':
        return t.availability.tooltips.disk.value;
      case 'db':
        return t.availability.tooltips.db.value;
      case 'missing':
        return t.availability.tooltips.missing.value;
      default:
        return status;
    }
  };

  const renderAvailabilityChip = (availability?: FileAvailability) => {
    if (!availability) return null;
    const status = availability.status;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getAvailabilityColor(status)}`}
        title={getAvailabilityTooltip(status)}
      >
        <span className={`h-2 w-2 rounded-full ${getAvailabilityDot(status)}`} />
        {getAvailabilityLabel(status)}
      </span>
    );
  };

  const filteredFiles = files.filter(file => {
    const normalizedBank = (file.bankName || '').toLowerCase();
    const normalizedCategoryName = (file.category?.name || '').toLowerCase();
    const normalizedAccount = (file.metadata?.accountNumber || '').toLowerCase();

    const matchesSearch =
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizedBank.includes(searchQuery.toLowerCase()) ||
      normalizedAccount.includes(searchQuery.toLowerCase()) ||
      normalizedCategoryName.includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || file.status === filters.status;
    const matchesBank = !filters.bank || file.bankName === filters.bank;
    const matchesCategory = !filters.categoryId || file.categoryId === filters.categoryId;
    const matchesOwnership =
      !filters.ownership || (filters.ownership === 'owned' ? file.isOwner : !file.isOwner);

    return matchesSearch && matchesStatus && matchesBank && matchesCategory && matchesOwnership;
  });

  const sortedFiles = [...filteredFiles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalItems = sortedFiles.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const currentPage = Math.min(page, totalPagesCount);
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = totalItems === 0 ? 0 : Math.min(totalItems, currentPage * pageSize);

  const paginatedFiles = sortedFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (page > totalPagesCount) {
      setPage(totalPagesCount);
    }
  }, [page, totalPagesCount]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ status: '', bank: '', categoryId: '', ownership: '' });
  };

  const filtersApplied =
    !!filters.status || !!filters.bank || !!filters.categoryId || !!filters.ownership;

  const renderStatusBadge = (status: string) => {
    const tone = getStatusTone(status);
    const toneClass =
      tone === 'success'
        ? 'bg-green-100 text-green-800 border-green-200'
        : tone === 'warning'
          ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
          : tone === 'error'
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
        <span
          className={`h-2 w-2 rounded-full ${
            tone === 'success'
              ? 'bg-green-500'
              : tone === 'warning'
                ? 'bg-yellow-500'
                : tone === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
          }`}
        />
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-secondary mt-1">{t.subtitle}</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto relative">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder.value}
              aria-label="Поиск по файлам"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setFilterOpen(prev => !prev)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <Filter className="-ml-1 mr-2 h-5 w-5" />
              {t.filters.button}
              {filtersApplied && <span className="ml-2 h-2 w-2 rounded-full bg-white" />}
            </button>

            {filterOpen && (
              <div
                ref={filterPanelRef}
                className="absolute right-0 top-14 z-30 w-80 rounded-2xl border border-gray-100 bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <span className="text-sm font-semibold text-gray-900">{t.filters.title}</span>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800"
                  >
                    {t.filters.reset}
                  </button>
                </div>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">{t.filters.status}</label>
                    <select
                      value={filters.status}
                      onChange={e => handleFilterChange('status', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t.filters.all}</option>
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">{t.filters.bank}</label>
                    <select
                      value={filters.bank}
                      onChange={e => handleFilterChange('bank', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t.filters.all}</option>
                      {bankOptions.map(bank => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">{t.filters.category}</label>
                    <select
                      value={filters.categoryId}
                      onChange={e => handleFilterChange('categoryId', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t.filters.all}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">{t.filters.accessType}</label>
                    <select
                      value={filters.ownership}
                      onChange={e => handleFilterChange('ownership', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t.filters.all}</option>
                      <option value="owned">{t.filters.owned}</option>
                      <option value="shared">{t.filters.shared}</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {t.filters.apply}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t.subtitle}</h2>
          {filtersApplied && (
            <span className="text-xs font-medium text-gray-500">
              {t.filters.title} · {t.filters.button}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t.empty.title}</h3>
            <p className="mt-1 text-gray-500">{t.empty.subtitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.fileName}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.bank}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.account}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.size}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.status}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.category}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.access}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t.table.createdAt}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    {t.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedFiles.map(file => (
                  <tr
                    key={file.id}
                    className="transition-all duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <DocumentTypeIcon
                            fileType={file.fileType}
                            fileName={file.fileName}
                            size={22}
                            className="text-red-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-semibold text-gray-900 truncate">
                            {file.fileName}
                          </div>
                          <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-gray-500">
                            {file.sharedLinksCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-blue-600">
                                <Share2 size={12} />
                                {file.sharedLinksCount} {t.sharedLinksShort}
                              </span>
                            )}
                            {renderAvailabilityChip(file.fileAvailability)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BankLogoAvatar bankName={file.bankName} size={28} />
                        <span className="text-sm font-medium text-gray-800">
                          {getBankDisplayName(file.bankName)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        {file.metadata?.accountNumber
                          ? `••••${file.metadata.accountNumber.slice(-4)}`
                          : '—'}
                      </span>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                      {formatFileSize(file.fileSize)}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                      {renderStatusBadge(file.status)}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                      <select
                        value={file.categoryId || ''}
                        onChange={e => handleCategoryChange(file.id, e.target.value)}
                        disabled={
                          categoriesLoading || (!file.isOwner && file.permissionType !== 'editor')
                        }
                        className="min-w-[160px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50"
                      >
                        <option value="">{t.categoryCell.none}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          file.isOwner
                            ? 'bg-gray-100 text-gray-800 border border-gray-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        {file.isOwner
                          ? t.permission.owner.value
                          : getPermissionLabel(file.permissionType)}
                      </span>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex flex-col leading-tight">
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                      <div className="relative inline-flex items-center justify-end gap-1" ref={openMenuId === file.id ? actionMenuRef : null}>
                        <button
                          onClick={() => handleView(file.id)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                          title={t.actions.tooltipView.value}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title={t.actions.tooltipDownload.value}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setOpenMenuId(prev => (prev === file.id ? null : file.id));
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title={t.table.actions.value}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === file.id && (
                          <div
                            className="absolute right-0 top-12 z-20 w-48 rounded-2xl border border-gray-100 bg-white shadow-xl"
                            onClick={event => event.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                handleView(file.id);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                            >
                              <Eye size={16} /> {t.actions.view}
                            </button>
                            <button
                              onClick={() => {
                                handleDownload(file.id, file.fileName);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                            >
                              <Download size={16} /> {t.actions.download}
                            </button>
                            {file.isOwner && (
                              <>
                                <button
                                  onClick={() => {
                                    handleShare(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                                >
                                  <Share2 size={16} /> {t.actions.share}
                                </button>
                                <button
                                  onClick={() => {
                                    handleManagePermissions(file.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
                                >
                                  <ShieldCheck size={16} /> {t.actions.permissions}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-2 sm:px-0 mt-4">
        <div className="text-sm text-gray-600">
          {totalItems === 0 ? t.empty.title : `Показано ${rangeStart}–${rangeEnd} из ${totalItems}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm border transition-all ${
              currentPage <= 1
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Предыдущая
          </button>
          <span className="text-sm text-gray-600">
            Страница {currentPage} из {totalPagesCount}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPagesCount, prev + 1))}
            disabled={currentPage >= totalPagesCount}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm border transition-all ${
              currentPage >= totalPagesCount
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Следующая
          </button>
        </div>
      </div>
    </div>
  );
}
