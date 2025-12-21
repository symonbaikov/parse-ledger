'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Icon } from '@iconify/react';
import { Trash2 } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import type {
  CellMouseDownEvent,
  CellMouseOverEvent,
  CellValueChangedEvent,
  ColDef,
  ColumnResizedEvent,
  FilterChangedEvent,
  GridReadyEvent,
  IHeaderParams,
  RowClassParams,
  SelectionChangedEvent,
} from 'ag-grid-community';

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';

export interface CustomTableColumn {
  id: string;
  key: string;
  title: string;
  type: ColumnType;
  position: number;
  config: Record<string, any> | null;
  style?: {
    header?: Record<string, any>;
    cell?: Record<string, any>;
  } | null;
}

export interface CustomTableGridRow {
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

type CellSelectionRef = { rowId: string; colId: string };

function EditableColumnHeader(
  params: IHeaderParams & {
    onRenameColumnTitle?: (columnKey: string, nextTitle: string) => Promise<void>;
    onDeleteColumn?: (columnKey: string) => void;
    headerIcon?: string | null;
  },
) {
  const colId = params.column?.getColId?.() || '';
  const isSystem = !colId || colId.startsWith('__');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(params.displayName || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setValue(params.displayName || '');
  }, [params.displayName, editing]);

  const startEditing = () => {
    if (isSystem) return;
    setEditing(true);
  };

  const commit = async () => {
    if (isSystem) return;
    const next = value.trim();
    const prev = (params.displayName || '').trim();
    setEditing(false);
    if (!next || next === prev) return;
    if (!params.onRenameColumnTitle) return;
    try {
      setSaving(true);
      await params.onRenameColumnTitle(colId, next);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setEditing(false);
    setValue(params.displayName || '');
  };

  const renderHeaderIcon = (iconStr?: string | null) => {
    if (!iconStr) return null;
    if (iconStr.startsWith('http://') || iconStr.startsWith('https://') || iconStr.startsWith('/uploads/')) {
      return <img src={iconStr} alt="" className="h-4 w-4 object-contain" />;
    }
    return <Icon icon={iconStr} className="h-4 w-4" />;
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
        }}
        className="w-full h-7 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    );
  }

  return (
    <div className="flex items-center justify-between gap-1" title={isSystem ? undefined : 'Двойной клик — переименовать'}>
      <div
        onDoubleClick={startEditing}
        className={saving ? 'opacity-60 flex-1 truncate inline-flex items-center gap-1' : 'flex-1 truncate inline-flex items-center gap-1'}
        style={{ minWidth: 0 }}
      >
        {renderHeaderIcon(params.headerIcon)}
        <span className="truncate">{params.displayName}</span>
      </div>
      {!isSystem && params.onDeleteColumn ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            params.onDeleteColumn?.(colId);
          }}
          className="h-6 w-6 flex items-center justify-center rounded border border-transparent text-gray-400 hover:text-red-500 hover:border-red-200"
          title="Удалить колонку"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

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

const mapFontFamily = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const quoted = /[\\s"]/g.test(trimmed) && !trimmed.includes(',') ? `"${trimmed.replace(/"/g, '\\"')}"` : trimmed;
  if (trimmed.includes(',')) return trimmed;
  return `${quoted}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
};

const sheetStyleToCss = (style: Record<string, any>) => {
  const backgroundColor = typeof style.backgroundColor === 'string' ? style.backgroundColor : undefined;
  const textAlign = mapHorizontalAlignment(style.horizontalAlignment);

  const tf = style.textFormat && typeof style.textFormat === 'object' ? (style.textFormat as any) : null;
  const color = tf && typeof tf.foregroundColor === 'string' ? tf.foregroundColor : undefined;
  const fontWeight = tf && typeof tf.bold === 'boolean' ? (tf.bold ? 700 : 400) : undefined;
  const fontStyle = tf && typeof tf.italic === 'boolean' ? (tf.italic ? 'italic' : 'normal') : undefined;

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
  const fontFamily = tf && typeof tf.fontFamily === 'string' ? mapFontFamily(tf.fontFamily) : undefined;

  return { backgroundColor, textAlign, color, fontWeight, fontStyle, textDecorationLine, fontSize, fontFamily };
};

const normalizeFiltersParam = (filters: RowFilter[]): string | undefined => {
  const compact = filters.filter(Boolean);
  if (!compact.length) return undefined;
  return JSON.stringify(compact);
};

const agFilterModelToRowFilters = (model: any, columnsByKey: Map<string, CustomTableColumn>): RowFilter[] => {
  if (!model || typeof model !== 'object') return [];
  const result: RowFilter[] = [];

  for (const [colKey, value] of Object.entries(model)) {
    const col = columnsByKey.get(colKey);
    if (!col) continue;

    // agSetColumnFilter
    if (isPlainObject(value) && Array.isArray((value as any).values)) {
      const values = (value as any).values;
      if (!values.length) continue;
      if (col.type === 'boolean' && values.length > 1) {
        // Selecting both true/false is effectively "no filter" for boolean.
        continue;
      }
      if (values.length === 1) {
        result.push({ col: colKey, op: 'eq', value: values[0] });
      } else {
        result.push({ col: colKey, op: 'in', value: values });
      }
      continue;
    }

    // Text/Number/Date filter models
    const type = isPlainObject(value) ? String((value as any).type || '') : '';
    if (!type) continue;

    if (type === 'blank') {
      result.push({ col: colKey, op: 'isEmpty' });
      continue;
    }
    if (type === 'notBlank') {
      result.push({ col: colKey, op: 'isNotEmpty' });
      continue;
    }

    const rawFilter = (value as any).filter;
    const rawFilterTo = (value as any).filterTo;
    const dateFrom = (value as any).dateFrom;
    const dateTo = (value as any).dateTo;

    const textValue =
      rawFilter === null || rawFilter === undefined ? '' : typeof rawFilter === 'string' ? rawFilter : String(rawFilter);

    const numberValue = typeof rawFilter === 'number' ? rawFilter : Number(rawFilter);
    const numberValueTo = typeof rawFilterTo === 'number' ? rawFilterTo : Number(rawFilterTo);

    const isNumber = col.type === 'number';
    const isDate = col.type === 'date';

    const asDate = (input: unknown) => {
      const s = typeof input === 'string' ? input.trim() : String(input ?? '').trim();
      if (!s) return null;
      // ag-grid gives YYYY-MM-DD for date filters.
      return s;
    };

    const mapType = (t: string): RowFilterOp | null => {
      switch (t) {
        case 'contains':
          return 'contains';
        case 'equals':
          return 'eq';
        case 'notEqual':
          return 'neq';
        case 'startsWith':
          return 'startsWith';
        case 'greaterThan':
          return 'gt';
        case 'greaterThanOrEqual':
          return 'gte';
        case 'lessThan':
          return 'lt';
        case 'lessThanOrEqual':
          return 'lte';
        case 'inRange':
          return 'between';
        default:
          return null;
      }
    };

    const mapped = mapType(type);
    if (!mapped) continue;

    if (mapped === 'between') {
      if (isDate) {
        const from = asDate(dateFrom);
        const to = asDate(dateTo);
        if (!from || !to) continue;
        result.push({ col: colKey, op: 'between', value: [from, to] });
        continue;
      }
      if (isNumber) {
        if (!Number.isFinite(numberValue) || !Number.isFinite(numberValueTo)) continue;
        result.push({ col: colKey, op: 'between', value: [numberValue, numberValueTo] });
        continue;
      }
      const from = textValue.trim();
      const to = typeof rawFilterTo === 'string' ? rawFilterTo.trim() : String(rawFilterTo ?? '').trim();
      if (!from || !to) continue;
      result.push({ col: colKey, op: 'between', value: [from, to] });
      continue;
    }

    if (isDate) {
      const date = asDate(dateFrom);
      if (!date) continue;
      result.push({ col: colKey, op: mapped, value: date });
      continue;
    }

    if (isNumber) {
      if (!Number.isFinite(numberValue)) continue;
      result.push({ col: colKey, op: mapped, value: numberValue });
      continue;
    }

    const v = textValue.trim();
    if (!v) continue;
    result.push({ col: colKey, op: mapped, value: v });
  }

  return result;
};

const ruLocaleText: Record<string, string> = {
  // Common
  loadingOoo: 'Загрузка...',
  noRowsToShow: 'Нет строк для отображения',
  enabled: 'Включено',
  disabled: 'Отключено',

  // Filters
  filterOoo: 'Фильтр...',
  equals: 'Равно',
  notEqual: 'Не равно',
  blank: 'Пусто',
  notBlank: 'Не пусто',
  empty: 'Выберите',
  lessThan: 'Меньше',
  greaterThan: 'Больше',
  lessThanOrEqual: 'Меньше или равно',
  greaterThanOrEqual: 'Больше или равно',
  inRange: 'В диапазоне',
  inRangeStart: 'От',
  inRangeEnd: 'До',
  contains: 'Содержит',
  notContains: 'Не содержит',
  startsWith: 'Начинается с',
  endsWith: 'Заканчивается на',
  andCondition: 'И',
  orCondition: 'ИЛИ',
  applyFilter: 'Применить',
  resetFilter: 'Сбросить',
  clearFilter: 'Очистить',
  cancelFilter: 'Отмена',

  // Filter panels / column menu
  columns: 'Колонки',
  filters: 'Фильтры',
  pinColumn: 'Закрепить колонку',
  valueColumns: 'Колонки значений',
  pivotMode: 'Режим сводной таблицы',
  groups: 'Группы строк',
  rowGroupColumnsEmptyMessage: 'Перетащите сюда для группировки',
  valuesColumnsEmptyMessage: 'Перетащите сюда для значений',
  pivotsColumnsEmptyMessage: 'Перетащите сюда для заголовков',
};

export function CustomTableAgGrid(props: {
  tableId: string;
  columns: CustomTableColumn[];
  rows: CustomTableGridRow[];
  columnWidths: Record<string, number>;
  isFullscreen: boolean;
  loadingRows: boolean;
  hasMore: boolean;
  onLoadMore: (opts?: { reset?: boolean; filtersParam?: string }) => void;
  onFiltersParamChange: (filtersParam: string | undefined) => void;
  onUpdateCell: (rowId: string, columnKey: string, value: any) => Promise<void>;
  onDeleteRow: (rowId: string) => void;
  onPersistColumnWidth: (columnKey: string, width: number) => Promise<void>;
  selectedColumnKeys: string[];
  onSelectedColumnKeysChange: (keys: string[]) => void;
  onRenameColumnTitle: (columnKey: string, nextTitle: string) => Promise<void>;
  onDeleteColumn?: (columnKey: string) => void;
  onSelectedRowIdsChange: (rowIds: string[]) => void;
}) {
  const gridApiRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const columnsByKey = useMemo(() => new Map(props.columns.map((c) => [c.key, c])), [props.columns]);
  const selectedColSet = useMemo(() => new Set(props.selectedColumnKeys), [props.selectedColumnKeys]);

  const selectionDragRef = useRef<{
    active: boolean;
    anchorColId: string | null;
    lastColId: string | null;
  }>({ active: false, anchorColId: null, lastColId: null });

  const cellSelectionDragRef = useRef(false);
  const [selectionAnchor, setSelectionAnchor] = useState<CellSelectionRef | null>(null);
  const [selectionFocus, setSelectionFocus] = useState<CellSelectionRef | null>(null);
  const [gridReady, setGridReady] = useState(false);

  const rowIndexById = useMemo(() => {
    const map = new Map<string, number>();
    props.rows.forEach((row, index) => {
      map.set(row.id, index);
    });
    return map;
  }, [props.rows]);

  const columnIndexById = useMemo(() => {
    const map = new Map<string, number>();
    props.columns.forEach((col, index) => {
      map.set(col.key, index);
    });
    return map;
  }, [props.columns]);

  const selectionBounds = useMemo(() => {
    if (!selectionAnchor || !selectionFocus) return null;
    const anchorRow = rowIndexById.get(selectionAnchor.rowId);
    const focusRow = rowIndexById.get(selectionFocus.rowId);
    const anchorCol = columnIndexById.get(selectionAnchor.colId);
    const focusCol = columnIndexById.get(selectionFocus.colId);
    if (
      anchorRow === undefined ||
      focusRow === undefined ||
      anchorCol === undefined ||
      focusCol === undefined
    ) {
      return null;
    }
    return {
      rowStart: Math.min(anchorRow, focusRow),
      rowEnd: Math.max(anchorRow, focusRow),
      colStart: Math.min(anchorCol, focusCol),
      colEnd: Math.max(anchorCol, focusCol),
    };
  }, [selectionAnchor, selectionFocus, rowIndexById, columnIndexById]);

  const isCellRangeSelected = useCallback(
    (rowId: string | undefined, colId: string | undefined) => {
      if (!selectionBounds || !rowId || !colId) return false;
      const rowIndex = rowIndexById.get(rowId);
      const colIndex = columnIndexById.get(colId);
      if (rowIndex === undefined || colIndex === undefined) return false;
      return (
        rowIndex >= selectionBounds.rowStart &&
        rowIndex <= selectionBounds.rowEnd &&
        colIndex >= selectionBounds.colStart &&
        colIndex <= selectionBounds.colEnd
      );
    },
    [selectionBounds, rowIndexById, columnIndexById],
  );

  const getSelectableDisplayedColIds = (): string[] => {
    const api = gridApiRef.current;
    const cols = api?.getAllDisplayedColumns?.() || [];
    return (cols as any[])
      .map((c) => (typeof c?.getColId === 'function' ? c.getColId() : null))
      .filter((id: any) => typeof id === 'string' && id && !id.startsWith('__'));
  };

  const applyColumnRangeSelection = (anchor: string, current: string) => {
    const displayed = getSelectableDisplayedColIds();
    const a = displayed.indexOf(anchor);
    const b = displayed.indexOf(current);
    if (a === -1 || b === -1) return;
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    const next = displayed.slice(start, end + 1);
    props.onSelectedColumnKeysChange(next);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const getHeaderColIdFromTarget = (target: EventTarget | null): string | null => {
      const el = target as HTMLElement | null;
      if (!el) return null;
      const tag = el.tagName?.toLowerCase();
      if (tag && ['input', 'textarea', 'select', 'button'].includes(tag)) return null;
      if (el.closest('.ag-floating-filter')) return null;
      if (el.closest('.ag-header-cell-resize')) return null;
      const cell = el.closest?.('.ag-header-row.ag-header-row-column .ag-header-cell') as HTMLElement | null;
      if (!cell) return null;
      const colId = cell.getAttribute('col-id');
      if (!colId || colId.startsWith('__')) return null;
      return colId;
    };

    const onMouseMove = (e: MouseEvent) => {
      const drag = selectionDragRef.current;
      if (!drag.active || !drag.anchorColId) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const colId = getHeaderColIdFromTarget(el);
      if (!colId || colId === drag.lastColId) return;
      drag.lastColId = colId;
      applyColumnRangeSelection(drag.anchorColId, colId);
    };

    const stopDrag = () => {
      const drag = selectionDragRef.current;
      drag.active = false;
      drag.anchorColId = null;
      drag.lastColId = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseUp = () => stopDrag();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.detail && e.detail > 1) return;
      const colId = getHeaderColIdFromTarget(e.target);
      if (!colId) return;

      // Support ctrl/cmd toggle without drag.
      if (e.ctrlKey || e.metaKey) {
        const next = new Set(props.selectedColumnKeys);
        if (next.has(colId)) next.delete(colId);
        else next.add(colId);
        props.onSelectedColumnKeysChange(Array.from(next));
        return;
      }
      selectionDragRef.current.active = true;
      selectionDragRef.current.anchorColId = colId;
      selectionDragRef.current.lastColId = colId;
      applyColumnRangeSelection(colId, colId);

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    root.addEventListener('mousedown', onMouseDown);
    return () => {
      root.removeEventListener('mousedown', onMouseDown);
      stopDrag();
    };
  }, [props.selectedColumnKeys, props.onSelectedColumnKeysChange]);

  useEffect(() => {
    const stopCellDrag = () => {
      if (cellSelectionDragRef.current) {
        cellSelectionDragRef.current = false;
      }
    };
    window.addEventListener('mouseup', stopCellDrag);
    return () => {
      window.removeEventListener('mouseup', stopCellDrag);
    };
  }, []);

  const handleCellMouseDown = useCallback(
    (event: CellMouseDownEvent<CustomTableGridRow>) => {
      const rowId = typeof event.data?.id === 'string' ? event.data.id : null;
      const colId = event.colDef?.colId;
      if (!rowId || !colId || colId.startsWith('__')) return;
      if (!columnIndexById.has(colId)) return;
      const ref = { rowId, colId };
      setSelectionAnchor(ref);
      setSelectionFocus((prev) => (prev?.rowId === ref.rowId && prev?.colId === ref.colId ? prev : ref));
      cellSelectionDragRef.current = true;
    },
    [columnIndexById],
  );

  const handleCellMouseOver = useCallback(
    (event: CellMouseOverEvent<CustomTableGridRow>) => {
      if (!cellSelectionDragRef.current) return;
      const rowId = typeof event.data?.id === 'string' ? event.data.id : null;
      const colId = event.colDef?.colId;
      if (!rowId || !colId || colId.startsWith('__')) return;
      if (!columnIndexById.has(colId)) return;
      setSelectionFocus((prev) => {
        if (prev?.rowId === rowId && prev?.colId === colId) return prev;
        return { rowId, colId };
      });
    },
    [columnIndexById],
  );

  const handleCellMouseUp = useCallback(() => {
    if (cellSelectionDragRef.current) {
      cellSelectionDragRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!gridReady) return;
    const api = gridApiRef.current;
    if (!api) return;
    api.addEventListener('cellMouseDown', handleCellMouseDown);
    api.addEventListener('cellMouseOver', handleCellMouseOver);
    api.addEventListener('cellMouseUp', handleCellMouseUp);
    return () => {
      try {
        api.removeEventListener('cellMouseDown', handleCellMouseDown);
        api.removeEventListener('cellMouseOver', handleCellMouseOver);
        api.removeEventListener('cellMouseUp', handleCellMouseUp);
      } catch {
        // ignore after unmount
      }
    };
  }, [gridReady, handleCellMouseDown, handleCellMouseOver, handleCellMouseUp]);

  const headerCssRules = useMemo(() => {
    const lines: string[] = [];

    const esc = (value: string) => value.replace(/"/g, '\\"');
    const toJustify = (align: CSSProperties['textAlign']) => {
      if (align === 'center') return 'center';
      if (align === 'right') return 'flex-end';
      if (align === 'justify') return 'space-between';
      return 'flex-start';
    };

    for (const col of props.columns) {
      const headerStyle =
        (col.style && typeof col.style === 'object' ? (col.style as any).header : null) || {};
      const css = sheetStyleToCss(headerStyle);
      const rules: string[] = [];

      if (css.backgroundColor) rules.push(`background-color: ${css.backgroundColor};`);
      if (css.color) rules.push(`color: ${css.color};`);
      if (css.fontWeight) rules.push(`font-weight: ${css.fontWeight};`);
      if (css.fontStyle) rules.push(`font-style: ${css.fontStyle};`);
      if (css.textDecorationLine) rules.push(`text-decoration: ${css.textDecorationLine};`);
      if (css.fontSize) rules.push(`font-size: ${css.fontSize}px;`);
      if (css.fontFamily) rules.push(`font-family: ${css.fontFamily};`);
      if (css.textAlign) rules.push(`text-align: ${css.textAlign};`);

      if (!rules.length && !css.textAlign) continue;

      const colId = esc(col.key);
      if (rules.length) {
        lines.push(`.ag-theme-quartz .ag-header-cell[col-id="${colId}"] { ${rules.join(' ')} }`);
      }
      if (css.textAlign) {
        lines.push(
          `.ag-theme-quartz .ag-header-cell[col-id="${colId}"] .ag-header-cell-label { justify-content: ${toJustify(css.textAlign)}; }`,
        );
      }
    }

    return lines.join('\n');
  }, [props.columns]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      resizable: true,
      sortable: false,
      editable: true,
      filter: true,
      floatingFilter: true,
    };
  }, []);

  const getRowStyle = useCallback(
    (params: RowClassParams) => {
      const styles = params.data?.styles || {};
      if (styles.manualFill) {
        return { backgroundColor: styles.manualFill, color: '#fff' };
      }
      const tag = styles.manualTag;
      if (tag === 'heading') {
        return { backgroundColor: '#111827', color: '#fff' };
      }
      if (tag === 'total') {
        return { backgroundColor: '#0f172a', color: '#fff' };
      }
      return undefined;
    },
    [],
  );

  const colDefs = useMemo<Array<ColDef<CustomTableGridRow>>>(() => {
    const defs: Array<ColDef<CustomTableGridRow>> = [
      {
        colId: '__rowNumber',
        headerName: '#',
        pinned: 'left',
        width: 80,
        minWidth: 60,
        maxWidth: 120,
        editable: false,
        filter: false,
        valueGetter: (p) => p.data?.rowNumber,
        cellClass: 'text-gray-500',
      },
    ];

    for (const col of props.columns) {
      const baseCellStyle =
        (col.style && typeof col.style === 'object' ? (col.style as any).cell : null) || {};

      defs.push({
        colId: col.key,
        headerName: col.title,
        headerComponent: EditableColumnHeader as any,
        headerComponentParams: {
          onRenameColumnTitle: props.onRenameColumnTitle,
          onDeleteColumn: props.onDeleteColumn,
          headerIcon: (col.config as any)?.icon || null,
        },
        width: props.columnWidths[col.key],
        minWidth: 80,
        headerClass: selectedColSet.has(col.key) ? 'ff-col-selected' : undefined,
        cellClassRules: {
          'ff-col-selected-cell': () => selectedColSet.has(col.key),
          'ff-cell-range-selected': (params: any) => isCellRangeSelected(params.data?.id, col.key),
        },
        valueGetter: (p) => (p.data?.data ? p.data.data[col.key] : null),
        valueSetter: (p) => {
          if (!p.data) return false;
          p.data.data = { ...(p.data.data || {}), [col.key]: p.newValue };
          return true;
        },
        valueFormatter: (p) => {
          const v = p.value;
          if (Array.isArray(v)) return v.join(', ');
          if (v === null || v === undefined) return '';
          return String(v);
        },
        cellStyle: (p) => {
          const override = p.data?.styles && typeof p.data.styles === 'object' ? (p.data.styles as any)[col.key] : null;
          const merged = mergeSheetStyle(baseCellStyle, override);
          const css = sheetStyleToCss(merged);
          return {
            ...(css.backgroundColor ? { backgroundColor: css.backgroundColor } : {}),
            ...(css.textAlign ? { textAlign: css.textAlign } : {}),
            ...(css.color ? { color: css.color } : {}),
            ...(css.fontWeight ? { fontWeight: css.fontWeight } : {}),
            ...(css.fontStyle ? { fontStyle: css.fontStyle } : {}),
            ...(css.textDecorationLine ? { textDecorationLine: css.textDecorationLine } : {}),
            ...(css.fontSize ? { fontSize: css.fontSize } : {}),
            ...(css.fontFamily ? { fontFamily: css.fontFamily } : {}),
          };
        },
        // Header styles are applied via injected CSS rules (AG Grid ColDef doesn't support inline `headerStyle` in our setup).
        ...(col.type === 'boolean'
          ? {
              editable: false,
              filter: 'agSetColumnFilter',
              cellRenderer: (p: any) => {
                const checked = Boolean(p.value);
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      e.stopPropagation();
                      p.setValue(Boolean(e.target.checked));
                    }}
                    className="h-4 w-4"
                  />
                );
              },
            }
          : null),
      });
    }

    defs.push({
      colId: '__actions',
      headerName: '',
      pinned: 'right',
      width: 64,
      minWidth: 56,
      maxWidth: 88,
      editable: false,
      filter: false,
      cellRenderer: (p: any) => {
        const rowId = p.data?.id;
        const canDelete = typeof rowId === 'string' && rowId.length > 0;
        return (
          <button
            type="button"
            title="Удалить"
            disabled={!canDelete}
            onClick={(e) => {
              e.stopPropagation();
              if (canDelete) props.onDeleteRow(rowId);
            }}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        );
      },
    });

    return defs;
  }, [props.columns, props.columnWidths, props.onDeleteRow, props.onRenameColumnTitle, selectedColSet, isCellRangeSelected]);

  const onGridReady = (event: GridReadyEvent) => {
    gridApiRef.current = event.api as any;
    setGridReady(true);
  };

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const rows = event.api.getSelectedRows?.() || [];
      const ids = rows
        .map((row) => (row as CustomTableGridRow)?.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0);
      props.onSelectedRowIdsChange(ids);
    },
    [props],
  );

  const onFilterChanged = (event: FilterChangedEvent) => {
    const model = event.api.getFilterModel();
    const filters = agFilterModelToRowFilters(model, columnsByKey);
    props.onFiltersParamChange(normalizeFiltersParam(filters));
  };

  const onCellValueChanged = async (event: CellValueChangedEvent<CustomTableGridRow>) => {
    const columnKey = event.colDef.colId;
    if (!columnKey || columnKey.startsWith('__')) return;
    const rowId = event.data?.id;
    if (!rowId) return;

    const col = columnsByKey.get(columnKey);
    if (!col) return;

    let nextValue: any = event.newValue;
    if (nextValue === '' || nextValue === undefined) nextValue = null;

    if (col.type === 'boolean') {
      nextValue = Boolean(nextValue);
    } else if (col.type === 'multi_select') {
      if (typeof nextValue === 'string') {
        const arr = nextValue
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        nextValue = arr.length ? arr : null;
      } else if (Array.isArray(nextValue)) {
        nextValue = nextValue.length ? nextValue : null;
      }
    }

    try {
      await props.onUpdateCell(rowId, columnKey, nextValue);
    } catch {
      // Revert on failure.
      event.api.refreshCells({ rowNodes: [event.node], force: true });
    }
  };

  const onColumnResized = async (event: ColumnResizedEvent) => {
    if (!event.finished) return;
    const colId = event.column?.getColId();
    if (!colId || colId.startsWith('__')) return;
    const width = event.column?.getActualWidth?.();
    if (!(typeof width === 'number' && Number.isFinite(width) && width > 0)) return;
    await props.onPersistColumnWidth(colId, width);
  };

  // Infinite-ish loading: when we get near the end of already loaded rows, ask for more.
  useEffect(() => {
    const api = gridApiRef.current || null;
    if (!api) return;

    const onScroll = () => {
      if (props.loadingRows || !props.hasMore) return;
      const last =
        api.getLastDisplayedRowIndex?.() ??
        api.getLastDisplayedRow?.();
      if (typeof last !== 'number') return;
      if (last >= props.rows.length - 10) {
        props.onLoadMore({ reset: false });
      }
    };

    api.addEventListener?.('bodyScroll', onScroll);
    return () => {
      try {
        if (typeof api.isDestroyed === 'function' && api.isDestroyed()) return;
        api.removeEventListener?.('bodyScroll', onScroll);
      } catch {
        // ignore (grid might already be destroyed)
      }
    };
  }, [props.loadingRows, props.hasMore, props.rows.length, props.onLoadMore]);

  return (
    <div
      ref={rootRef}
      className={props.isFullscreen ? 'h-full' : undefined}
      style={{ width: '100%', height: props.isFullscreen ? '100%' : '70vh', minHeight: props.isFullscreen ? undefined : 520 }}
    >
      <div className="ag-theme-quartz" style={{ width: '100%', height: '100%' }}>
        {headerCssRules ? <style>{headerCssRules}</style> : null}
        <AgGridReact<CustomTableGridRow>
          rowData={props.rows}
          localeText={ruLocaleText}
          getRowId={(p) => {
            const id = (p.data as any)?.id;
            if (typeof id === 'string' && id.trim()) return id;
            const rowNumber = (p.data as any)?.rowNumber;
            if (typeof rowNumber === 'number' && Number.isFinite(rowNumber)) return `row_${rowNumber}`;
            const idx = (p as any)?.rowIndex ?? (p as any)?.node?.rowIndex ?? 0;
            return `row_${idx}`;
          }}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          ensureDomOrder
          rowSelection="multiple"
          rowMultiSelectWithClick
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onCellValueChanged={onCellValueChanged}
          onColumnResized={onColumnResized}
          onSelectionChanged={handleSelectionChanged}
          getRowStyle={getRowStyle}
          animateRows={false}
          headerHeight={42}
          rowHeight={38}
          rowModelType="clientSide"
          rowBuffer={Math.min(50, Math.max(10, Math.floor(props.rows.length / 20)))}
          domLayout="normal"
        />
      </div>
    </div>
  );
}
