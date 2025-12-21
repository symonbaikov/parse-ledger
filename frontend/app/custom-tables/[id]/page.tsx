'use client';

import { useEffect, useMemo, useState, useRef, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Columns,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
  Rows,
  Save,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { Menu, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import apiClient from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';
import ConfirmModal from '@/app/components/ConfirmModal';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { CustomTableAgGrid } from './CustomTableAgGrid';

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
type EditingScope = 'name' | 'description' | 'both';

interface CustomTableColumn {
  id: string;
  key: string;
  title: string;
  type: ColumnType;
  isRequired: boolean;
  isUnique: boolean;
  position: number;
  config: Record<string, any> | null;
  style?: {
    header?: Record<string, any>;
    cell?: Record<string, any>;
  } | null;
}

interface CustomTable {
  id: string;
  name: string;
  description: string | null;
  source: string;
  categoryId?: string | null;
  category?: { id: string; name: string; color?: string | null; icon?: string | null } | null;
  columns: CustomTableColumn[];
  viewSettings?: Record<string, any> | null;
}

interface CustomTableRow {
  id: string;
  rowNumber: number;
  data: Record<string, any>;
  styles?: Record<string, any> | null;
}

type RowFilterOp =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'startsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'isEmpty'
  | 'isNotEmpty';

type RowFilter = { col: string; op: RowFilterOp; value?: any };

const COLUMN_TYPES: Array<{ value: ColumnType; label: string }> = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'date', label: 'Дата' },
  { value: 'boolean', label: 'Да/Нет' },
  { value: 'select', label: 'Выбор' },
  { value: 'multi_select', label: 'Мультивыбор' },
];

const COLUMN_ICONS = [
  'mdi:tag',
  'mdi:briefcase',
  'mdi:account',
  'mdi:account-group',
  'mdi:cash',
  'mdi:shopping',
  'mdi:warehouse',
  'mdi:truck',
  'mdi:office-building',
  'mdi:home',
  'mdi:chart-line',
  'mdi:file-document-outline',
  'mdi:calendar',
  'mdi:star',
];

export default function CustomTableDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const tableId = params?.id;

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [savingMeta, setSavingMeta] = useState(false);
  const [editingScope, setEditingScope] = useState<EditingScope | null>('both');
  const [pencilMenuAnchor, setPencilMenuAnchor] = useState<HTMLElement | null>(null);

  const [table, setTable] = useState<CustomTable | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; color?: string | null; icon?: string | null }>>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [rows, setRows] = useState<CustomTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [gridFiltersParam, setGridFiltersParam] = useState<string | undefined>(undefined);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [bulkDeleteColumnsOpen, setBulkDeleteColumnsOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowStyleTagLoading, setRowStyleTagLoading] = useState(false);

  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState<{ title: string; type: ColumnType }>({
    title: '',
    type: 'text',
  });
  const [newColumnIcon, setNewColumnIcon] = useState<string>('mdi:tag');
  const [columnIconOpen, setColumnIconOpen] = useState(false);
  const [uploadingColumnIcon, setUploadingColumnIcon] = useState(false);
  const columnIconInputRef = useRef<HTMLInputElement | null>(null);
  const [activeFilterColKey, setActiveFilterColKey] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const filterPopoverRef = useRef<HTMLDivElement | null>(null);

  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [calendarFromOpen, setCalendarFromOpen] = useState(false);
  const [calendarToOpen, setCalendarToOpen] = useState(false);
  const calendarFromRef = useRef<HTMLDivElement | null>(null);
  const calendarToRef = useRef<HTMLDivElement | null>(null);

  const DEFAULT_COLUMN_WIDTH = 180;
  const MIN_COLUMN_WIDTH = 60;
  const MAX_COLUMN_WIDTH = 1200;
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);
  const [resizingColKey, setResizingColKey] = useState<string | null>(null);

  const [deleteColumnModalOpen, setDeleteColumnModalOpen] = useState(false);
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<CustomTableColumn | null>(null);
  const [deleteRowModalOpen, setDeleteRowModalOpen] = useState(false);
  const [deleteRowTarget, setDeleteRowTarget] = useState<CustomTableRow | null>(null);
  const [mounted, setMounted] = useState(false);

  const orderedColumns = useMemo(() => {
    const cols = table?.columns || [];
    return [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [table?.columns]);

  const activeCategory =
    categories.find((cat) => cat.id === categoryId) || table?.category || null;

  useEffect(() => {
    const allowed = new Set(orderedColumns.map((c) => c.key));
    setSelectedColumnKeys((prev) => prev.filter((k) => allowed.has(k)));
  }, [orderedColumns]);

  useEffect(() => {
    if (!table) return;
    const viewCols =
      (table.viewSettings && typeof table.viewSettings === 'object' ? (table.viewSettings as any).columns : null) || {};
    const newWidths: Record<string, number> = {};
    for (const col of orderedColumns) {
      let width = viewCols?.[col.key]?.width;
      if (!(typeof width === 'number' && Number.isFinite(width))) {
        width = (col as any).width;
      }
      if (!(typeof width === 'number' && Number.isFinite(width))) {
        width = DEFAULT_COLUMN_WIDTH;
      }
      newWidths[col.key] = width;
    }
    setColumnWidths(newWidths);
  }, [table?.id, orderedColumns, DEFAULT_COLUMN_WIDTH]);

  const clampWidth = (width: number) => Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, width));

  const getColumnWidth = (colKey: string) => {
    const width = columnWidths[colKey];
    if (typeof width === 'number' && Number.isFinite(width)) return width;
    return DEFAULT_COLUMN_WIDTH;
  };

  const gridColumnWidths = useMemo(() => {
    const next: Record<string, number> = {};
    for (const col of orderedColumns) {
      next[col.key] = getColumnWidth(col.key);
    }
    return next;
  }, [orderedColumns, columnWidths]);

  const persistColumnWidth = async (colKey: string, width: number) => {
    if (!tableId) return;
    const prevWidth = getColumnWidth(colKey);
    const finalWidth = clampWidth(width);
    if (Math.abs(finalWidth - prevWidth) < 1) return;

    setColumnWidths((prev) => ({ ...prev, [colKey]: finalWidth }));
    try {
      await apiClient.patch(`/custom-tables/${tableId}/view-settings/columns`, {
        columnKey: colKey,
        width: finalWidth,
      });
    } catch (error) {
      console.error('Failed to persist column width:', error);
      toast.error('Не удалось сохранить ширину колонки');
      setColumnWidths((prev) => ({ ...prev, [colKey]: prevWidth }));
    }
  };

  const isPlainObject = (value: unknown): value is Record<string, any> => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return false;
    return true;
  };

  const mergeSheetStyle = (
    base: Record<string, any> | null | undefined,
    override: Record<string, any> | null | undefined,
  ): Record<string, any> => {
    const merged: Record<string, any> = { ...(base || {}) };
    if (!override) return merged;
    for (const [key, value] of Object.entries(override)) {
      if (value === null) {
        delete merged[key];
      } else if (value !== undefined) {
        const existing = merged[key];
        if (isPlainObject(existing) && isPlainObject(value)) {
          merged[key] = mergeSheetStyle(existing, value);
        } else {
          merged[key] = value;
        }
      }
    }
    return merged;
  };

  const mapHorizontalAlignment = (value: unknown): CSSProperties['textAlign'] | undefined => {
    const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
    if (!raw) return undefined;
    if (raw === 'LEFT') return 'left';
    if (raw === 'CENTER') return 'center';
    if (raw === 'RIGHT') return 'right';
    if (raw === 'JUSTIFY') return 'justify';
    return undefined;
  };

  const mapVerticalAlignment = (value: unknown): CSSProperties['verticalAlign'] | undefined => {
    const raw = typeof value === 'string' ? value.trim().toUpperCase() : '';
    if (!raw) return undefined;
    if (raw === 'TOP') return 'top';
    if (raw === 'MIDDLE' || raw === 'CENTER') return 'middle';
    if (raw === 'BOTTOM') return 'bottom';
    return undefined;
  };

  const mapFontFamily = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const quoted = /[\\s"]/g.test(trimmed) && !trimmed.includes(',') ? `"${trimmed.replace(/"/g, '\\"')}"` : trimmed;
    if (trimmed.includes(',')) return trimmed;
    return `${quoted}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
  };

  const getCellCss = (style: Record<string, any>) => {
    const backgroundColor = typeof style.backgroundColor === 'string' ? style.backgroundColor : undefined;
    const textAlign = mapHorizontalAlignment(style.horizontalAlignment);
    const verticalAlign = mapVerticalAlignment(style.verticalAlignment);

    const tf = style.textFormat && typeof style.textFormat === 'object' ? (style.textFormat as any) : null;
    const color = tf && typeof tf.foregroundColor === 'string' ? tf.foregroundColor : undefined;
    const fontWeight =
      tf && typeof tf.bold === 'boolean' ? (tf.bold ? 700 : 400) : undefined;
    const fontStyle =
      tf && typeof tf.italic === 'boolean' ? (tf.italic ? 'italic' : 'normal') : undefined;

    const underline = tf && typeof tf.underline === 'boolean' ? tf.underline : undefined;
    const strikethrough = tf && typeof tf.strikethrough === 'boolean' ? tf.strikethrough : undefined;
    let textDecorationLine: CSSProperties['textDecorationLine'] | undefined;
    if (underline === true || strikethrough === true) {
      const parts: string[] = [];
      if (underline === true) parts.push('underline');
      if (strikethrough === true) parts.push('line-through');
      textDecorationLine = parts.join(' ') as any;
    } else if (underline === false || strikethrough === false) {
      textDecorationLine = 'none';
    }

    const fontSize =
      tf && typeof tf.fontSize === 'number' && Number.isFinite(tf.fontSize) && tf.fontSize > 0 ? tf.fontSize : undefined;
    const fontFamily =
      tf && typeof tf.fontFamily === 'string' ? mapFontFamily(tf.fontFamily) : undefined;

    return { backgroundColor, textAlign, verticalAlign, color, fontWeight, fontStyle, textDecorationLine, fontSize, fontFamily };
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      const payload = response.data?.data || response.data || [];
      setCategories(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTable = async () => {
    if (!tableId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/custom-tables/${tableId}`);
      const payload = response.data?.data || response.data;
      setTable(payload);
      const currentCategoryId = payload?.categoryId || payload?.category?.id || '';
      setCategoryId(currentCategoryId || '');
    } catch (error) {
      console.error('Failed to load table:', error);
      toast.error('Не удалось загрузить таблицу');
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async (opts?: { reset?: boolean; filtersParam?: string }) => {
    if (!tableId) return;
    if (loadingRows) return;
    setLoadingRows(true);
    try {
      const cursor = opts?.reset ? undefined : rows[rows.length - 1]?.rowNumber;
      const filters = opts?.filtersParam !== undefined ? opts.filtersParam : combinedFiltersParam;
      const response = await apiClient.get(`/custom-tables/${tableId}/rows`, {
        params: { cursor, limit: 50, filters },
      });
      const items = response.data?.items || response.data?.data?.items || [];
      const next = Array.isArray(items) ? items : [];
      setRows((prev) => {
        const merged = opts?.reset ? next : [...prev, ...next];
        const seen = new Set<string>();
        const deduped: typeof merged = [];
        for (const row of merged) {
          const id = (row as any)?.id || String((row as any)?.rowNumber);
          if (!id || seen.has(id)) continue;
          seen.add(id);
          deduped.push(row);
        }
        return deduped;
      });
      setHasMore(next.length >= 50);
    } catch (error) {
      console.error('Failed to load rows:', error);
      toast.error('Не удалось загрузить строки');
    } finally {
      setLoadingRows(false);
    }
  };

  const onGridFiltersParamChange = (next: string | undefined) => {
    if (next === gridFiltersParam) return;
    setGridFiltersParam(next);
  };

  const parseDateValue = (value: unknown): Date | null => {
    if (!value) return null;
    const raw = typeof value === 'string' ? value : String(value);
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const requestFilters = useMemo<RowFilter[]>(() => {
    const result: RowFilter[] = [];

    const toIsoDate = (date: Date) => format(date, 'yyyy-MM-dd', { locale: ru });

    for (const col of orderedColumns) {
      const state = columnFilters[col.key];
      if (!state) continue;

      if (col.type === 'number') {
        const min = state?.min !== undefined && state?.min !== '' ? Number(state.min) : undefined;
        const max = state?.max !== undefined && state?.max !== '' ? Number(state.max) : undefined;
        if (Number.isFinite(min) && Number.isFinite(max)) {
          result.push({ col: col.key, op: 'between', value: [min, max] });
        } else if (Number.isFinite(min)) {
          result.push({ col: col.key, op: 'gte', value: min });
        } else if (Number.isFinite(max)) {
          result.push({ col: col.key, op: 'lte', value: max });
        }
        continue;
      }

      if (col.type === 'date') {
        const from = state?.from ? new Date(`${state.from}T00:00:00`) : undefined;
        const to = state?.to ? new Date(`${state.to}T00:00:00`) : undefined;
        const fromOk = from && !Number.isNaN(from.getTime());
        const toOk = to && !Number.isNaN(to.getTime());
        if (fromOk && toOk) {
          result.push({ col: col.key, op: 'between', value: [toIsoDate(from!), toIsoDate(to!)] });
        } else if (fromOk) {
          result.push({ col: col.key, op: 'gte', value: toIsoDate(from!) });
        } else if (toOk) {
          result.push({ col: col.key, op: 'lte', value: toIsoDate(to!) });
        }
        continue;
      }

      if (col.type === 'boolean') {
        const v = state?.value;
        if (v === 'true') result.push({ col: col.key, op: 'eq', value: true });
        if (v === 'false') result.push({ col: col.key, op: 'eq', value: false });
        continue;
      }

      const op: RowFilterOp = state?.op || 'contains';
      if (op === 'isEmpty' || op === 'isNotEmpty') {
        result.push({ col: col.key, op });
        continue;
      }

      const rawValue = typeof state?.value === 'string' ? state.value : String(state?.value ?? '');
      const value = rawValue.trim();
      if (!value) continue;

      if (op === 'in') {
        const values = value
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean);
        if (!values.length) continue;
        result.push({ col: col.key, op: 'in', value: values });
        continue;
      }

      result.push({ col: col.key, op, value });
    }

    return result;
  }, [orderedColumns, columnFilters]);

  const filtersParam = useMemo(
    () => (requestFilters.length ? JSON.stringify(requestFilters) : undefined),
    [requestFilters],
  );

  const parseFiltersParam = (raw: string | undefined): RowFilter[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as RowFilter[]) : [];
    } catch {
      return [];
    }
  };

  const dateFilterColKey = useMemo(() => {
    const firstDateCol = orderedColumns.find((c) => c.type === 'date');
    return firstDateCol?.key || null;
  }, [orderedColumns]);

  const dateFilters = useMemo<RowFilter[]>(() => {
    if (!dateFilterColKey) return [];
    const from = parseDateValue(dateFrom);
    const to = parseDateValue(dateTo);
    const fromOk = from && !Number.isNaN(from.getTime());
    const toOk = to && !Number.isNaN(to.getTime());
    if (!fromOk && !toOk) return [];

    const toIsoDate = (date: Date) => format(date, 'yyyy-MM-dd', { locale: ru });

    if (fromOk && toOk) {
      return [{ col: dateFilterColKey, op: 'between', value: [toIsoDate(from!), toIsoDate(to!)] }];
    }
    if (fromOk) return [{ col: dateFilterColKey, op: 'gte', value: toIsoDate(from!) }];
    return [{ col: dateFilterColKey, op: 'lte', value: toIsoDate(to!) }];
  }, [dateFilterColKey, dateFrom, dateTo]);

  const combinedFiltersParam = useMemo(() => {
    const base = parseFiltersParam(gridFiltersParam);
    const overrideCols = new Set<string>([...requestFilters.map((f) => f.col), ...dateFilters.map((f) => f.col)]);
    const baseWithoutOverrides = base.filter((f) => !overrideCols.has(f.col));
    const merged = [...baseWithoutOverrides, ...requestFilters, ...dateFilters];
    return merged.length ? JSON.stringify(merged) : undefined;
  }, [gridFiltersParam, requestFilters, dateFilters]);

  const selectedDateFrom = dateFrom ? (parseDateValue(dateFrom) ?? undefined) : undefined;
  const selectedDateTo = dateTo ? (parseDateValue(dateTo) ?? undefined) : undefined;

  const formatFilterInputValue = (value: string | null, placeholder: string) => {
    const parsed = parseDateValue(value);
    return parsed ? format(parsed, 'dd.MM.yyyy', { locale: ru }) : placeholder;
  };

  const hasActiveDateFilter = Boolean(dateFrom || dateTo);

  const hasActiveFilters = requestFilters.length > 0 || hasActiveDateFilter;

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(target)) {
        setActiveFilterColKey(null);
      }
      if (calendarFromRef.current && !calendarFromRef.current.contains(target)) {
        setCalendarFromOpen(false);
      }
      if (calendarToRef.current && !calendarToRef.current.contains(target)) {
        setCalendarToOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!user || !tableId) return;
    setRows([]);
    setHasMore(true);
    const timer = window.setTimeout(() => {
      loadRows({ reset: true, filtersParam: combinedFiltersParam });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [combinedFiltersParam, user, tableId]);

  const clearColumnFilter = (colKey: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
  };

  const clearAllFilters = () => {
    setActiveFilterColKey(null);
    setColumnFilters({});
    setDateFrom(null);
    setDateTo(null);
  };

  const activeFilterCols = useMemo(() => new Set(requestFilters.map((f) => f.col)), [requestFilters]);

  const toggleFilterPopover = (colKey: string) => {
    setActiveFilterColKey((prev) => (prev === colKey ? null : colKey));
    setColumnFilters((prev) => {
      if (prev[colKey]) return prev;
      const col = orderedColumns.find((c) => c.key === colKey);
      if (!col) return prev;
      const defaultsByType: Record<ColumnType, Record<string, any>> = {
        text: { op: 'contains', value: '' },
        select: { op: 'eq', value: '' },
        multi_select: { op: 'in', value: '' },
        number: { min: '', max: '' },
        date: { from: '', to: '' },
        boolean: { value: '' },
      };
      return { ...prev, [colKey]: defaultsByType[col.type] };
    });
  };

  const setColumnFilterState = (colKey: string, nextState: Record<string, any>) => {
    setColumnFilters((prev) => ({ ...prev, [colKey]: nextState }));
  };

  const startColumnResize = (colKey: string, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    if (target && 'setPointerCapture' in target) {
      target.setPointerCapture(event.pointerId);
    }
    const startWidth = getColumnWidth(colKey);
    resizeRef.current = { colKey, startX: event.clientX, startWidth };
    setResizingColKey(colKey);
  };

  useEffect(() => {
    if (!user) return;
    if (resizingColKey) {
      document.body.classList.add('ff-col-resizing');
    } else {
      document.body.classList.remove('ff-col-resizing');
    }
    return () => {
      document.body.classList.remove('ff-col-resizing');
    };
  }, [resizingColKey, user]);

  useEffect(() => {
    if (!resizingColKey) return;

    const onPointerMove = (event: PointerEvent) => {
      if (!resizeRef.current) return;
      const { colKey, startX, startWidth } = resizeRef.current;
      const delta = event.clientX - startX;
      const nextWidth = clampWidth(startWidth + delta);
      setColumnWidths((prev) => {
        if (prev[colKey] === nextWidth) return prev;
        return { ...prev, [colKey]: nextWidth };
      });
    };

    const onPointerUp = async () => {
      const state = resizeRef.current;
      if (!state) {
        resizeRef.current = null;
        setResizingColKey(null);
        return;
      }

      const finalWidth = clampWidth(getColumnWidth(state.colKey));
      const { colKey, startWidth } = state;
      resizeRef.current = null;
      setResizingColKey(null);

      if (Math.abs(finalWidth - startWidth) < 1) {
        return;
      }

      if (!tableId) return;

      try {
        await apiClient.patch(`/custom-tables/${tableId}/view-settings/columns`, {
          columnKey: colKey,
          width: finalWidth,
        });
        await loadTable();
      } catch (error) {
        console.error('Failed to persist column width:', error);
        toast.error('Не удалось сохранить ширину колонки');
        setColumnWidths((prev) => ({ ...prev, [colKey]: startWidth }));
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [resizingColKey, tableId]);

  useEffect(() => {
    if (!authLoading && user && tableId) {
      loadCategories();
      loadTable();
      loadRows({ reset: true });
    }
  }, [authLoading, user, tableId]);

  useEffect(() => {
    if (!table || editingMeta) return;
    setMetaDraft({
      name: table.name || '',
      description: table.description || '',
    });
  }, [table?.id, table?.name, table?.description, editingMeta]);

  useEffect(() => {
    if (!user) return;
    if (isFullscreen) {
      document.body.classList.add('ff-table-fullscreen');
    } else {
      document.body.classList.remove('ff-table-fullscreen');
    }
    return () => {
      document.body.classList.remove('ff-table-fullscreen');
    };
  }, [isFullscreen, user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag && ['input', 'textarea', 'select'].includes(tag)) return;
      if (target && (target as any).isContentEditable) return;
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const updateCategory = async (nextCategoryId: string) => {
    if (!tableId) return;
    setCategoryId(nextCategoryId);
    try {
      await apiClient.patch(`/custom-tables/${tableId}`, {
        categoryId: nextCategoryId ? nextCategoryId : null,
      });
      await loadTable();
      toast.success('Категория обновлена');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Не удалось обновить категорию');
    }
  };

  const openEditMeta = (scope: EditingScope) => {
    if (!table) return;
    setMetaDraft({
      name: table.name || '',
      description: table.description || '',
    });
    setEditingScope(scope);
    setEditingMeta(true);
  };

  const handlePencilClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    setPencilMenuAnchor(event.currentTarget);
  };

  const handleClosePencilMenu = () => {
    setPencilMenuAnchor(null);
  };

  const handleSelectEditScope = (scope: EditingScope) => {
    handleClosePencilMenu();
    openEditMeta(scope);
  };

  const cancelEditMeta = () => {
    setEditingMeta(false);
    setMetaDraft({
      name: table?.name || '',
      description: table?.description || '',
    });
    setEditingScope(null);
  };

  const saveMeta = async () => {
    if (!tableId) return;
    const scope: EditingScope = editingScope ?? 'both';
    const payload: Record<string, unknown> = {};

    if (scope !== 'description') {
      const name = metaDraft.name.trim();
      if (!name) {
        toast.error('Введите название таблицы');
        return;
      }
      payload.name = name;
    }

    if (scope !== 'name') {
      const description = metaDraft.description.trim();
      payload.description = description ? description : null;
    }

    if (!Object.keys(payload).length) {
      setEditingMeta(false);
      setEditingScope(null);
      return;
    }

    setSavingMeta(true);
    try {
      await apiClient.patch(`/custom-tables/${tableId}`, payload);
      setEditingMeta(false);
      setEditingScope(null);
      await loadTable();
      toast.success('Сохранено');
    } catch (error) {
      console.error('Failed to update table meta:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSavingMeta(false);
    }
  };

  const addRow = async () => {
    if (!tableId) return;
    const toastId = toast.loading('Добавление строки...');
    try {
      const response = await apiClient.post(`/custom-tables/${tableId}/rows`, { data: {} });
      const raw = response.data as any;
      const created =
        raw && typeof raw === 'object' && typeof raw.id === 'string' && typeof raw.rowNumber === 'number'
          ? raw
          : raw && typeof raw === 'object' && raw.data && typeof raw.data.id === 'string' && typeof raw.data.rowNumber === 'number'
            ? raw.data
            : null;
      if (!created) {
        throw new Error('Unexpected create row response');
      }
      setRows((prev) => [...prev, created]);
      toast.success('Строка добавлена', { id: toastId });
    } catch (error) {
      console.error('Failed to add row:', error);
      toast.error('Не удалось добавить строку', { id: toastId });
    }
  };

  const saveCell = async (row: CustomTableRow, column: CustomTableColumn, value: any) => {
    if (!tableId) return;
    const key = `${row.id}:${column.id}`;
    setSavingCell(key);
    try {
      await apiClient.patch(`/custom-tables/${tableId}/rows/${row.id}`, { data: { [column.key]: value } });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, data: { ...(r.data || {}), [column.key]: value } } : r)),
      );
    } catch (error) {
      console.error('Failed to update cell:', error);
      toast.error('Не удалось сохранить значение');
    } finally {
      setSavingCell(null);
    }
  };

  const saveRowPatch = async (rowId: string, patch: Record<string, any>) => {
    if (!tableId) return;
    if (!patch || typeof patch !== 'object') return;
    const { styles, ...dataPatch } = patch;
    const keys = Object.keys(dataPatch);
    const hasStyles = styles && typeof styles === 'object';
    if (!keys.length && !hasStyles) return;
    const key = `${rowId}:bulk`;
    setSavingCell(key);
    try {
      await apiClient.patch(`/custom-tables/${tableId}/rows/${rowId}`, {
        data: dataPatch,
        ...(hasStyles ? { styles } : {}),
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                data: { ...(r.data || {}), ...dataPatch },
                ...(hasStyles ? { styles: { ...(r.styles || {}), ...styles } } : {}),
              }
            : r,
        ),
      );
    } catch (error) {
      console.error('Failed to update row:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setSavingCell(null);
    }
  };

  const applyRowStyleTag = async (tag: 'heading' | 'total' | null) => {
    if (!selectedRowIds.length) {
      toast.error('Выберите строки, к которым нужно применить стиль');
      return;
    }
    setRowStyleTagLoading(true);
    try {
      for (const rowId of selectedRowIds) {
        const row = rows.find((r) => r.id === rowId);
        if (!row) continue;
        const nextStyles = { ...(row.styles || {}) };
        if (tag) {
          nextStyles.manualTag = tag;
        } else {
          delete nextStyles.manualTag;
        }
        await saveRowPatch(rowId, { styles: nextStyles });
      }
      toast.success('Стиль применён');
    } catch (error) {
      console.error('Failed to apply row style tag:', error);
      toast.error('Не удалось применить стиль');
    } finally {
      setRowStyleTagLoading(false);
    }
  };

  const updateCellFromGrid = async (rowId: string, columnKey: string, value: any) => {
    const row = rows.find((r) => r.id === rowId);
    const column = orderedColumns.find((c) => c.key === columnKey);
    if (!row || !column) return;
    await saveCell(row, column, value);
  };

  const requestDeleteRowFromGrid = (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    openDeleteRow(row);
  };

  const renameColumnTitleFromGrid = async (columnKey: string, nextTitle: string) => {
    if (!tableId) return;
    const col = orderedColumns.find((c) => c.key === columnKey);
    if (!col) return;
    const title = nextTitle.trim();
    if (!title) return;
    try {
      await apiClient.patch(`/custom-tables/${tableId}/columns/${col.id}`, { title });
      await loadTable();
      toast.success('Название колонки обновлено');
    } catch (error) {
      console.error('Failed to rename column:', error);
      toast.error('Не удалось переименовать колонку');
      throw error;
    }
  };

  const openDeleteColumn = (column: CustomTableColumn) => {
    setDeleteColumnTarget(column);
    setDeleteColumnModalOpen(true);
  };

  const deleteColumn = async () => {
    if (!tableId || !deleteColumnTarget) return;
    const toastId = toast.loading('Удаление колонки...');
    try {
      await apiClient.delete(`/custom-tables/${tableId}/columns/${deleteColumnTarget.id}`);
      toast.success('Колонка удалена', { id: toastId });
      setDeleteColumnModalOpen(false);
      setDeleteColumnTarget(null);
      await loadTable();
    } catch (error) {
      console.error('Failed to delete column:', error);
      toast.error('Не удалось удалить колонку', { id: toastId });
    }
  };

  const openDeleteRow = (row: CustomTableRow) => {
    setDeleteRowTarget(row);
    setDeleteRowModalOpen(true);
  };

  const deleteRow = async () => {
    if (!tableId || !deleteRowTarget) return;
    const toastId = toast.loading('Удаление строки...');
    try {
      await apiClient.delete(`/custom-tables/${tableId}/rows/${deleteRowTarget.id}`);
      toast.success('Строка удалена', { id: toastId });
      setRows((prev) => prev.filter((r) => r.id !== deleteRowTarget.id));
      setDeleteRowModalOpen(false);
      setDeleteRowTarget(null);
    } catch (error) {
      console.error('Failed to delete row:', error);
      toast.error('Не удалось удалить строку', { id: toastId });
    }
  };

  const renderIconPreview = (iconStr: string) => {
    if (
      iconStr.startsWith('http://') ||
      iconStr.startsWith('https://') ||
      iconStr.startsWith('/uploads/')
    ) {
      return <img src={iconStr} alt="icon" className="h-full w-full object-contain" />;
    }
    return <Icon icon={iconStr} className="h-full w-full" />;
  };

  const triggerColumnIconUpload = () => {
    columnIconInputRef.current?.click();
  };

  const handleColumnIconFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingColumnIcon(true);
    const formData = new FormData();
    formData.append('icon', file);
    try {
      const resp = await apiClient.post('/data-entry/custom-fields/icon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = resp.data?.url || resp.data?.data?.url;
      if (url) {
        setNewColumnIcon(url);
        toast.success('Иконка загружена');
      } else {
        throw new Error('URL missing');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось загрузить иконку';
      toast.error(message);
    } finally {
      setUploadingColumnIcon(false);
      if (columnIconInputRef.current) columnIconInputRef.current.value = '';
    }
  };

  const createColumn = async () => {
    if (!tableId) return;
    const title = newColumn.title.trim();
    if (!title) return;
    const toastId = toast.loading('Добавление колонки...');
    try {
      await apiClient.post(`/custom-tables/${tableId}/columns`, { 
        title, 
        type: newColumn.type,
        config: { icon: newColumnIcon }
      });
      toast.success('Колонка добавлена', { id: toastId });
      setNewColumnOpen(false);
      setNewColumn({ title: '', type: 'text' });
      setNewColumnIcon('mdi:tag');
      setColumnIconOpen(false);
      await loadTable();
    } catch (error) {
      console.error('Failed to create column:', error);
      toast.error('Не удалось добавить колонку', { id: toastId });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Загрузка...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Войдите в систему, чтобы просматривать таблицу.
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Таблица не найдена.
        </div>
      </div>
    );
  }


  // Client-side only rendering to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Загрузка...</div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? 'h-screen w-screen overflow-hidden bg-white'
          : 'max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }
      style={isFullscreen ? { paddingTop: '110px' } : undefined}
    >
      {/* Header Controls Inlined */}
      <div
        className={
          isFullscreen
            ? 'fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-md px-4 py-2.5'
            : 'mb-6 flex items-start justify-between gap-4'
        }
      >
       {/* Fullscreen layout adjustment: Flex container for the header content */}
        <div className={isFullscreen ? 'flex items-center justify-between gap-4 max-w-[1920px] mx-auto' : 'contents'}>
          <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/custom-tables')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className={isFullscreen ? 'hidden sm:inline' : ''}>Назад</span>
            </button>
            {!isFullscreen && (
                <Link href="/custom-tables" className="text-sm text-gray-400 hover:text-gray-600">
                / Таблицы
                </Link>
            )}
          </div>
          <div className="flex items-start gap-2">
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm"
              style={{ backgroundColor: activeCategory?.color || '#f3f4f6' }}
            >
              {activeCategory?.icon ? (
                <Icon icon={activeCategory.icon} className="h-6 w-6 text-gray-900" />
              ) : (
                <span className="text-2xl font-semibold text-gray-900">
                  {(activeCategory?.name || table.name || 'T').charAt(0)}
                </span>
              )}
            </span>
            <div className="flex-1">
              {editingMeta ? (
                <div className="flex flex-col gap-1">
                  {(editingScope ?? 'both') !== 'description' && (
                    <input
                      value={metaDraft.name}
                      onChange={(e) => setMetaDraft((prev) => ({ ...prev, name: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveMeta();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          cancelEditMeta();
                        }
                      }}
                      disabled={savingMeta}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      placeholder="Название таблицы"
                    />
                  )}
                  {(editingScope ?? 'both') !== 'name' && (
                    <textarea
                      value={metaDraft.description}
                      onChange={(e) => setMetaDraft((prev) => ({ ...prev, description: e.target.value }))}
                      rows={1}
                      disabled={savingMeta}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                      placeholder="Описание таблицы"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveMeta}
                      disabled={
                        savingMeta ||
                        ((editingScope ?? 'both') !== 'description' && !metaDraft.name.trim())
                      }
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Сохранить"
                    >
                      <Save className="h-4 w-4" />
                      <span className="ml-1 text-[11px]">Сохранить</span>
                    </button>
                    <button
                      onClick={cancelEditMeta}
                      disabled={savingMeta}
                      className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                      <span className="ml-1 text-[11px]">Отмена</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">{table.name}</h1>
                  <button
                    onClick={handlePencilClick}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"
                    title="Редактировать название и описание"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <Menu
                    anchorEl={pencilMenuAnchor}
                    open={Boolean(pencilMenuAnchor)}
                    onClose={handleClosePencilMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <MenuItem onClick={() => handleSelectEditScope('name')}>Изменить название</MenuItem>
                    <MenuItem onClick={() => handleSelectEditScope('description')}>Изменить описание</MenuItem>
                    <MenuItem onClick={() => handleSelectEditScope('both')}>Название и описание</MenuItem>
                  </Menu>
                </div>
              )}
            </div>
            {!editingMeta && (
              <div className="ml-3 flex items-center gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => updateCategory(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[150px]"
                >
                  <option value="">Без категории</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {!editingMeta && !isFullscreen && ( // Hide description in fullscreen header to save space
             <div className="text-secondary ml-[52px]">{table.description || '—'}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px]">
          <div className="flex items-center gap-1">
            <div className="relative" ref={calendarFromRef}>
              <button
                type="button"
                onClick={() => {
                  setCalendarFromOpen((v) => !v);
                  setCalendarToOpen(false);
                }}
                className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 transition ${dateFrom ? 'bg-primary text-white shadow-sm' : 'hover:bg-white'}`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>{dateFrom ? formatFilterInputValue(dateFrom, '') : 'Дата от'}</span>
              </button>
              {calendarFromOpen && (
                <div className="absolute right-0 z-30 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg p-3 origin-top-right">
                  <DayPicker
                    mode="single"
                    selected={selectedDateFrom}
                    locale={ru}
                    onSelect={(date) => {
                      if (!date) return;
                      setDateFrom(date.toISOString());
                      setCalendarFromOpen(false);
                    }}
                    fromYear={2000}
                    toYear={2035}
                  />
                </div>
              )}
            </div>
            <div className="relative" ref={calendarToRef}>
              <button
                type="button"
                onClick={() => {
                  setCalendarToOpen((v) => !v);
                  setCalendarFromOpen(false);
                }}
                className={`inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 transition ${dateTo ? 'bg-primary text-white shadow-sm' : 'hover:bg-white'}`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>{dateTo ? formatFilterInputValue(dateTo, '') : 'Дата до'}</span>
              </button>
              {calendarToOpen && (
                <div className="absolute right-0 z-30 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg p-3 origin-top-right">
                  <DayPicker
                    mode="single"
                    selected={selectedDateTo}
                    locale={ru}
                    onSelect={(date) => {
                      if (!date) return;
                      setDateTo(date.toISOString());
                      setCalendarToOpen(false);
                    }}
                    fromYear={2000}
                    toYear={2035}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-primary hover:text-primary disabled:opacity-50"
              disabled={zoomLevel <= 0.5}
              title="Уменьшить масштаб"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-[11px] font-medium text-gray-700 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-primary hover:text-primary disabled:opacity-50"
              disabled={zoomLevel >= 1.5}
              title="Увеличить масштаб"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNewColumnOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-primary hover:text-primary"
            >
              <Columns className="h-4 w-4" />
              <span>Колонка</span>
            </button>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white transition hover:bg-primary-hover"
            >
              <Rows className="h-4 w-4" />
              <span>Строка</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-500">
              {selectedRowIds.length ? `Выбрано строк: ${selectedRowIds.length}` : 'Стиль строки'}
            </span>
            {['heading', 'total', null].map((tag) => (
              <button
                key={String(tag)}
                onClick={() => applyRowStyleTag(tag as 'heading' | 'total' | null)}
                disabled={rowStyleTagLoading || !selectedRowIds.length}
                className={`min-w-[72px] rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                  tag
                    ? 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary'
                    : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${rowStyleTagLoading || !selectedRowIds.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tag === 'heading' && 'Заголовок'}
                {tag === 'total' && 'Итог'}
                {tag === null && 'Очистить'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {newColumnOpen && (
         <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
           {/* Repurposed New Column Form */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Название колонки</label>
              <input
                value={newColumn.title}
                onChange={(e) => setNewColumn((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Например: Сумма, Дата, Контрагент"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Тип</label>
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn((prev) => ({ ...prev, type: e.target.value as ColumnType }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {COLUMN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 relative">
                {/* Icon Picker (Existing Logic) */}
               <label className="block text-xs font-semibold text-gray-700 mb-1">Иконка</label>
              <button
                type="button"
                onClick={() => setColumnIconOpen((v) => !v)}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                 <div className="h-4 w-4">
                  {renderIconPreview(newColumnIcon || 'mdi:tag')}
                </div>
                <span className="text-sm font-semibold">Выбрать</span>
              </button>
              {columnIconOpen && (
                 <div className="absolute mt-2 z-20 w-[320px] rounded-xl border border-gray-200 bg-white shadow-xl p-4">
                    {/* ... Icon grid ... */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {COLUMN_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            setNewColumnIcon(icon);
                            setColumnIconOpen(false);
                          }}
                          className={`inline-flex items-center justify-center h-9 w-9 rounded-lg border transition-colors ${
                            newColumnIcon === icon
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                           <div className="h-5 w-5">
                            {renderIconPreview(icon)}
                          </div>
                        </button>
                      ))}
                    </div>
                     <div className="border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          triggerColumnIconUpload();
                          setTimeout(() => setColumnIconOpen(false), 0);
                        }}
                        disabled={uploadingColumnIcon}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white py-2 text-sm font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all"
                      >
                        {uploadingColumnIcon ? 'Загрузка...' : 'Загрузить иконку'}
                      </button>
                    </div>
                 </div>
              )}
            </div>
            {/* Hidden Input */}
             <input
              ref={columnIconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleColumnIconFileChange}
            />
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNewColumnOpen(false);
                  setColumnIconOpen(false);
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={createColumn}
                disabled={!newColumn.title.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
            </div>
          </div>
         </div>
       )}
    </div>

      {/* Main Table Area */}
      <div 
        className={
            isFullscreen 
            ? `h-full w-full transition-all duration-300 pt-0` // No padding in full immersive
            : undefined
        }
      >
        <div
          className={
            isFullscreen
              ? 'h-full w-full bg-white transition-all duration-300'
              : 'overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'
          }
        >
          <div 
             style={{ 
               transform: `scale(${zoomLevel})`, 
               transformOrigin: 'top left',
               width: `${100 / zoomLevel}%`,
               height: `${100 / zoomLevel}%`
             }}
          >
          <CustomTableAgGrid
            tableId={tableId as string}
            columns={orderedColumns}
            rows={rows}
            columnWidths={gridColumnWidths}
            isFullscreen={isFullscreen}
            loadingRows={loadingRows}
            hasMore={hasMore}
            onLoadMore={loadRows}
            onFiltersParamChange={onGridFiltersParamChange}
            onUpdateCell={updateCellFromGrid}
            
          onDeleteRow={requestDeleteRowFromGrid}
          onPersistColumnWidth={persistColumnWidth}
          selectedColumnKeys={selectedColumnKeys}
          onSelectedColumnKeysChange={setSelectedColumnKeys}
          onRenameColumnTitle={renameColumnTitleFromGrid}
          onSelectedRowIdsChange={setSelectedRowIds}
        />
          </div>
        </div>
      </div>
{/* Existing Modals ... */}


      <div className={isFullscreen ? 'mt-3 flex items-center justify-center' : 'mt-4 flex items-center justify-center'}>
        <button
          onClick={() => loadRows()}
          disabled={!hasMore || loadingRows}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingRows ? 'Загрузка...' : hasMore ? 'Загрузить ещё' : 'Больше нет строк'}
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteColumnModalOpen}
        onClose={() => {
          setDeleteColumnModalOpen(false);
          setDeleteColumnTarget(null);
        }}
        onConfirm={deleteColumn}
        title="Удалить колонку?"
        message={
          deleteColumnTarget
            ? `Колонка “${deleteColumnTarget.title}” будет удалена. Значения в строках останутся в данных, но не будут отображаться (пока не добавите колонку снова).`
            : 'Колонка будет удалена.'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive
      />

      <ConfirmModal
        isOpen={deleteRowModalOpen}
        onClose={() => {
          setDeleteRowModalOpen(false);
          setDeleteRowTarget(null);
        }}
        onConfirm={deleteRow}
        title="Удалить строку?"
        message={
          deleteRowTarget
            ? `Строка #${deleteRowTarget.rowNumber} будет удалена.`
            : 'Строка будет удалена.'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        isDestructive
      />
    </div>
  );
}
