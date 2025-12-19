'use client';

import { useEffect, useMemo, useState, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Filter, Maximize2, Minimize2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Icon } from '@iconify/react';
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

export default function CustomTableDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const tableId = params?.id;

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [savingMeta, setSavingMeta] = useState(false);

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

  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumn, setNewColumn] = useState<{ title: string; type: ColumnType }>({
    title: '',
    type: 'text',
  });
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

  const orderedColumns = useMemo(() => {
    const cols = table?.columns || [];
    return [...cols].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [table?.columns]);

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
      const filters = opts?.filtersParam !== undefined ? opts.filtersParam : gridFiltersParam;
      const response = await apiClient.get(`/custom-tables/${tableId}/rows`, {
        params: { cursor, limit: 50, filters },
      });
      const items = response.data?.items || response.data?.data?.items || [];
      const next = Array.isArray(items) ? items : [];
      setRows((prev) => (opts?.reset ? next : [...prev, ...next]));
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
    setRows([]);
    setHasMore(true);
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

  const parseDateValue = (value: unknown): Date | null => {
    if (!value) return null;
    const raw = typeof value === 'string' ? value : String(value);
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

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
    const timer = window.setTimeout(() => {
      loadRows({ reset: true });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [gridFiltersParam, user, tableId]);

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

  const startEditMeta = () => {
    if (!table) return;
    setMetaDraft({
      name: table.name || '',
      description: table.description || '',
    });
    setEditingMeta(true);
  };

  const cancelEditMeta = () => {
    setEditingMeta(false);
    setMetaDraft({
      name: table?.name || '',
      description: table?.description || '',
    });
  };

  const saveMeta = async () => {
    if (!tableId) return;
    const name = metaDraft.name.trim();
    if (!name) {
      toast.error('Введите название таблицы');
      return;
    }
    const description = metaDraft.description.trim();

    setSavingMeta(true);
    try {
      await apiClient.patch(`/custom-tables/${tableId}`, {
        name,
        description: description ? description : null,
      });
      setEditingMeta(false);
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
      const created = response.data?.data || response.data;
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

  const createColumn = async () => {
    if (!tableId) return;
    const title = newColumn.title.trim();
    if (!title) return;
    const toastId = toast.loading('Добавление колонки...');
    try {
      await apiClient.post(`/custom-tables/${tableId}/columns`, { title, type: newColumn.type });
      toast.success('Колонка добавлена', { id: toastId });
      setNewColumnOpen(false);
      setNewColumn({ title: '', type: 'text' });
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

  return (
    <div
      className={
        isFullscreen
          ? 'h-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
      }
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/custom-tables')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </button>
            <Link href="/custom-tables" className="text-sm text-gray-400 hover:text-gray-600">
              / Таблицы
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200"
              style={{ backgroundColor: table.category?.color || '#f3f4f6' }}
            >
              {table.category?.icon ? (
                <Icon icon={table.category.icon} className="h-5 w-5 text-gray-900" />
              ) : (
                <span className="text-gray-900 font-semibold">T</span>
              )}
            </span>
            {editingMeta ? (
              <div className="flex items-center gap-2 w-full max-w-[520px]">
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
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
                  placeholder="Название таблицы"
                />
                <button
                  onClick={saveMeta}
                  disabled={savingMeta || !metaDraft.name.trim()}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Сохранить"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEditMeta}
                  disabled={savingMeta}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Отмена"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{table.name}</h1>
                <button
                  onClick={startEditMeta}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  title="Редактировать название и описание"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {editingMeta ? (
            <textarea
              value={metaDraft.description}
              onChange={(e) => setMetaDraft((prev) => ({ ...prev, description: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelEditMeta();
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  saveMeta();
                }
              }}
              disabled={savingMeta}
              rows={2}
              className="mt-2 w-full max-w-[720px] resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
              placeholder="Описание (опционально)"
            />
          ) : (
            <p className="text-secondary mt-1">{table.description || '—'}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="text-xs font-semibold text-gray-700">Категория:</div>
            <select
              value={categoryId}
              onChange={(e) => updateCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title={isFullscreen ? 'Выйти из полноэкранного режима (Esc)' : 'Открыть в полноэкранном режиме'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Выйти' : 'Полный экран'}
          </button>
          <button
            onClick={() => setNewColumnOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Колонка
          </button>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Строка
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Фильтры активны</div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Очистить все
          </button>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Фильтр по дате</div>
        <div className="flex flex-wrap gap-2">
          <div className="relative" ref={calendarFromRef}>
            <button
              type="button"
              onClick={() => {
                setCalendarFromOpen((v) => !v);
                setCalendarToOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {formatFilterInputValue(dateFrom, 'Дата от')}
            </button>
            {calendarFromOpen && (
              <div className="absolute left-0 z-30 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg p-3">
                <style>{`
                  .rdp { --rdp-cell-size: 36px; --rdp-accent-color: #0a66c2; --rdp-background-color: #e3f2fd; margin: 0; }
                  .rdp-button { font-size: 0.875rem; font-weight: 500; }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f0f0f0; font-weight: 600; }
                  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: 700; }
                  .rdp-head_cell { color: #0a66c2; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
                  .rdp-caption_label { font-weight: 700; color: #191919; font-size: 0.95rem; }
                  .rdp-nav_button { color: #0a66c2; padding: 4px 6px; border-radius: 6px; }
                  .rdp-nav_button:hover { background-color: #e3f2fd; color: #0a66c2; }
                `}</style>
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
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {formatFilterInputValue(dateTo, 'Дата до')}
            </button>
            {calendarToOpen && (
              <div className="absolute left-0 z-30 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg p-3">
                <style>{`
                  .rdp { --rdp-cell-size: 36px; --rdp-accent-color: #0a66c2; --rdp-background-color: #e3f2fd; margin: 0; }
                  .rdp-button { font-size: 0.875rem; font-weight: 500; }
                  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f0f0f0; font-weight: 600; }
                  .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: 700; }
                  .rdp-head_cell { color: #0a66c2; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
                  .rdp-caption_label { font-weight: 700; color: #191919; font-size: 0.95rem; }
                  .rdp-nav_button { color: #0a66c2; padding: 4px 6px; border-radius: 6px; }
                  .rdp-nav_button:hover { background-color: #e3f2fd; color: #0a66c2; }
                `}</style>
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
      </div>

      {newColumnOpen && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-3">
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
            <div className="md:col-span-1 flex gap-2 justify-end">
              <button
                onClick={() => setNewColumnOpen(false)}
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

      <div className={isFullscreen ? 'flex-1 min-h-0 overflow-hidden' : undefined}>
        <div
          className={
            isFullscreen
              ? 'h-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm'
              : 'overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'
          }
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
          />
          {false && (
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: 72 }} />
              {orderedColumns.map((col) => (
                <col key={col.id} style={{ width: getColumnWidth(col.key) }} />
              ))}
              <col style={{ width: 64 }} />
            </colgroup>
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 w-[72px]">#</th>
              {orderedColumns.map((col) => {
                const columnIcon = (col.config as any)?.icon;
                const isFiltered = activeFilterCols.has(col.key);
                const filterState = columnFilters[col.key] || {};
                const headerStyle = (col.style && typeof col.style === 'object' ? (col.style as any).header : null) || {};
                const headerCss = getCellCss(headerStyle);
                const thStyle: CSSProperties | undefined =
                  headerCss.backgroundColor ||
                  headerCss.textAlign ||
                  headerCss.verticalAlign ||
                  headerCss.color ||
                  headerCss.fontWeight ||
                  headerCss.fontStyle ||
                  headerCss.textDecorationLine ||
                  headerCss.fontSize ||
                  headerCss.fontFamily
                    ? {
                        ...(headerCss.backgroundColor ? { backgroundColor: headerCss.backgroundColor } : {}),
                        ...(headerCss.textAlign ? { textAlign: headerCss.textAlign } : {}),
                        ...(headerCss.verticalAlign ? { verticalAlign: headerCss.verticalAlign } : {}),
                        ...(headerCss.color ? { color: headerCss.color } : {}),
                        ...(headerCss.fontWeight ? { fontWeight: headerCss.fontWeight } : {}),
                        ...(headerCss.fontStyle ? { fontStyle: headerCss.fontStyle } : {}),
                        ...(headerCss.textDecorationLine ? { textDecorationLine: headerCss.textDecorationLine } : {}),
                        ...(headerCss.fontSize ? { fontSize: headerCss.fontSize } : {}),
                        ...(headerCss.fontFamily ? { fontFamily: headerCss.fontFamily } : {}),
                      }
                    : undefined;
                return (
                  <th
                    key={col.id}
                    className="group relative px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap"
                    style={thStyle}
                  >
                    <div className="flex items-center gap-2">
                      {typeof columnIcon === 'string' && columnIcon ? (
                        <Icon icon={columnIcon} className="h-4 w-4 text-gray-600" />
                      ) : null}
                      <span className="truncate max-w-[260px]" title={col.title}>
                        {col.title}
                      </span>
                      <div
                        className="relative"
                        ref={activeFilterColKey === col.key ? filterPopoverRef : null}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFilterPopover(col.key)}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-white"
                          title="Фильтр"
                        >
                          <Filter className="h-3.5 w-3.5" />
                        </button>

                        {activeFilterColKey === col.key && (() => {
                          const rect = filterPopoverRef.current?.getBoundingClientRect();
                          const top = rect ? Math.min(window.innerHeight - 520, rect.bottom + 8) : 100;
                          const left = rect ? Math.max(16, Math.min(window.innerWidth - 356, rect.left)) : 100;
                          return (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveFilterColKey(null)} />
                              <div className="fixed z-30 w-[340px] max-w-[calc(100vw-32px)] max-h-[500px] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl overflow-y-auto" style={{ top: `${top}px`, left: `${left}px` }}>
                              <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Фильтр
                                  </div>
                                  <div className="truncate text-sm font-semibold text-gray-900" title={col.title}>
                                    {col.title}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveFilterColKey(null)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                                  title="Закрыть"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="space-y-3">
                              {(col.type === 'text' || col.type === 'select' || col.type === 'multi_select') && (
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-semibold text-gray-700">Оператор</label>
                                  <select
                                    value={
                                      filterState.op ??
                                      (col.type === 'text'
                                        ? 'contains'
                                        : col.type === 'select'
                                          ? 'eq'
                                          : 'in')
                                    }
                                    onChange={(e) => {
                                      const op = e.target.value as RowFilterOp;
                                      setColumnFilterState(col.key, { ...filterState, op });
                                    }}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  >
                                    {col.type === 'text' && (
                                      <>
                                        <option value="contains">Содержит</option>
                                        <option value="eq">Равно</option>
                                        <option value="startsWith">Начинается с</option>
                                        <option value="isEmpty">Пусто</option>
                                        <option value="isNotEmpty">Не пусто</option>
                                      </>
                                    )}
                                    {(col.type === 'select' || col.type === 'multi_select') && (
                                      <>
                                        <option value="eq">Равно</option>
                                        <option value="in">В списке</option>
                                        <option value="contains">Содержит</option>
                                        <option value="isEmpty">Пусто</option>
                                        <option value="isNotEmpty">Не пусто</option>
                                      </>
                                    )}
                                  </select>

                                  {filterState.op !== 'isEmpty' && filterState.op !== 'isNotEmpty' && (
                                    <>
                                      <label className="text-xs font-semibold text-gray-700">Значение</label>
                                      <input
                                        value={filterState.value ?? ''}
                                        onChange={(e) =>
                                          setColumnFilterState(col.key, { ...filterState, value: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        placeholder={
                                          filterState.op === 'in'
                                            ? 'Например: KZT, USD, EUR'
                                            : 'Введите значение'
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                              )}

                              {col.type === 'number' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-700">От</label>
                                    <input
                                      type="number"
                                      value={filterState.min ?? ''}
                                      onChange={(e) =>
                                        setColumnFilterState(col.key, { ...filterState, min: e.target.value })
                                      }
                                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-700">До</label>
                                    <input
                                      type="number"
                                      value={filterState.max ?? ''}
                                      onChange={(e) =>
                                        setColumnFilterState(col.key, { ...filterState, max: e.target.value })
                                      }
                                      className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                      placeholder="100000"
                                    />
                                  </div>
                                </div>
                              )}

                              {col.type === 'boolean' && (
                                <div className="grid grid-cols-1 gap-2">
                                  <label className="text-xs font-semibold text-gray-700">Значение</label>
                                  <select
                                    value={filterState.value ?? ''}
                                    onChange={(e) =>
                                      setColumnFilterState(col.key, { ...filterState, value: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  >
                                    <option value="">Все</option>
                                    <option value="true">Да</option>
                                    <option value="false">Нет</option>
                                  </select>
                                </div>
                              )}

                              {col.type === 'date' && (
                                <div className="grid grid-cols-1 gap-2">
                                  <div className="text-xs font-semibold text-gray-700">Период</div>
                                  <div className="text-sm text-gray-600">
                                    {filterState.from || filterState.to
                                      ? `${filterState.from || '…'} — ${filterState.to || '…'}`
                                      : 'Выберите даты'}
                                  </div>
                                  <div className="rounded-xl border border-gray-200 bg-white p-2">
                                    <style>{`
                                      .rdp { --rdp-cell-size: 34px; --rdp-accent-color: #0a66c2; --rdp-background-color: #e3f2fd; margin: 0; }
                                      .rdp-button { font-size: 0.875rem; font-weight: 500; }
                                      .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f0f0f0; font-weight: 600; }
                                      .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; font-weight: 700; }
                                      .rdp-head_cell { color: #0a66c2; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; }
                                      .rdp-caption_label { font-weight: 700; color: #191919; font-size: 0.95rem; }
                                      .rdp-nav_button { color: #0a66c2; padding: 4px 6px; border-radius: 6px; }
                                      .rdp-nav_button:hover { background-color: #e3f2fd; color: #0a66c2; }
                                    `}</style>
                                    <DayPicker
                                      mode="range"
                                      locale={ru}
                                      selected={{
                                        from: filterState.from ? new Date(`${filterState.from}T00:00:00`) : undefined,
                                        to: filterState.to ? new Date(`${filterState.to}T00:00:00`) : undefined,
                                      }}
                                      onSelect={(range: any) => {
                                        const from = range?.from ? format(range.from, 'yyyy-MM-dd') : '';
                                        const to = range?.to ? format(range.to, 'yyyy-MM-dd') : '';
                                        setColumnFilterState(col.key, { ...filterState, from, to });
                                      }}
                                      fromYear={2000}
                                      toYear={2035}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => clearColumnFilter(col.key)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <X className="h-4 w-4" />
                                Очистить
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveFilterColKey(null)}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                              >
                                Готово
                              </button>
                            </div>
                          </div>
                          </>
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => openDeleteColumn(col)}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-gray-200 text-gray-500 bg-white hover:bg-white"
                        title="Удалить колонку"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div
                      onPointerDown={(e) => startColumnResize(col.key, e)}
                      className="absolute right-0 top-0 z-20 h-full w-4 cursor-col-resize touch-none -mr-2 flex items-center justify-center hover:bg-primary/10"
                      title="Изменить ширину"
                    >
                      <div
                        className={[
                          'w-0.5 h-8 rounded-full',
                          resizingColKey === col.key ? 'bg-primary' : 'bg-gray-300',
                        ].join(' ')}
                      />
                    </div>
                  </th>
                );
              })}
              <th className="px-3 py-2 text-right font-semibold text-gray-700 w-[64px]"></th>
            </tr>
            </thead>
            <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={orderedColumns.length + 2} className="px-4 py-6 text-center text-gray-500">
                  {loadingRows
                    ? 'Загрузка...'
                    : requestFilters.length
                      ? 'Нет строк по текущим фильтрам.'
                      : 'Нет строк. Добавьте первую строку.'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
                  {orderedColumns.map((col) => {
                    const cellKey = `${row.id}:${col.id}`;
                    const value = (row.data || {})[col.key];
                    const isSaving = savingCell === cellKey;
                    const baseStyle = (col.style && typeof col.style === 'object' ? (col.style as any).cell : null) || {};
                    const overrideStyle =
                      (row.styles && typeof row.styles === 'object' ? (row.styles as any)[col.key] : null) || {};
                    const mergedStyle = mergeSheetStyle(baseStyle, overrideStyle);
                    const cellCss = getCellCss(mergedStyle);
                    const tdStyle: CSSProperties | undefined =
                      cellCss.backgroundColor || cellCss.verticalAlign
                        ? {
                            ...(cellCss.backgroundColor ? { backgroundColor: cellCss.backgroundColor } : {}),
                            ...(cellCss.verticalAlign ? { verticalAlign: cellCss.verticalAlign } : {}),
                          }
                        : undefined;
                    const inputStyle: CSSProperties | undefined =
                      cellCss.textAlign ||
                      cellCss.color ||
                      cellCss.fontWeight ||
                      cellCss.fontStyle ||
                      cellCss.textDecorationLine ||
                      cellCss.fontSize ||
                      cellCss.fontFamily
                        ? {
                            ...(cellCss.textAlign ? { textAlign: cellCss.textAlign } : {}),
                            ...(cellCss.color ? { color: cellCss.color } : {}),
                            ...(cellCss.fontWeight ? { fontWeight: cellCss.fontWeight } : {}),
                            ...(cellCss.fontStyle ? { fontStyle: cellCss.fontStyle } : {}),
                            ...(cellCss.textDecorationLine ? { textDecorationLine: cellCss.textDecorationLine } : {}),
                            ...(cellCss.fontSize ? { fontSize: cellCss.fontSize } : {}),
                            ...(cellCss.fontFamily ? { fontFamily: cellCss.fontFamily } : {}),
                          }
                        : undefined;

                    if (col.type === 'boolean') {
                      return (
                        <td key={col.id} className="px-3 py-2" style={tdStyle}>
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              disabled={isSaving}
                              onChange={(e) => saveCell(row, col, e.target.checked)}
                              className="h-4 w-4"
                            />
                            {isSaving && <span className="text-xs text-gray-400">…</span>}
                          </label>
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="px-3 py-2" style={tdStyle}>
                        <input
                          defaultValue={value ?? ''}
                          onBlur={(e) => {
                            const next = e.target.value;
                            const normalized = next === '' ? null : next;
                            if ((value ?? null) === normalized) return;
                            saveCell(row, col, normalized);
                          }}
                          disabled={isSaving}
                          style={inputStyle}
                          className="w-full rounded-lg border border-gray-200 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-transparent"
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => openDeleteRow(row)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-white"
                      title="Удалить строку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
          )}
        </div>
      </div>

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
