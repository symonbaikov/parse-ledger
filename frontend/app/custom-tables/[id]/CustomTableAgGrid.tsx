'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  CellValueChangedEvent,
  ColDef,
  ColumnResizedEvent,
  FilterChangedEvent,
  GridReadyEvent,
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
}) {
  const gridApiRef = useRef<any>(null);
  const columnsByKey = useMemo(() => new Map(props.columns.map((c) => [c.key, c])), [props.columns]);

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
      suppressMenuHide: false,
    };
  }, []);

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
        width: props.columnWidths[col.key],
        minWidth: 80,
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
              cellRenderer: (p: any) => {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.disabled = true;
                input.checked = Boolean(p.value);
                input.style.pointerEvents = 'none';
                return input;
              },
              editable: true,
              filter: 'agSetColumnFilter',
              valueSetter: (p: any) => {
                if (!p.data) return false;
                const v = Boolean(p.newValue);
                p.data.data = { ...(p.data.data || {}), [col.key]: v };
                return true;
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
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.action = 'delete';
        btn.title = 'Удалить';
        btn.textContent = 'Del';
        btn.style.width = '34px';
        btn.style.height = '28px';
        btn.style.border = '1px solid #e5e7eb';
        btn.style.borderRadius = '8px';
        btn.style.background = '#fff';
        btn.style.color = '#6b7280';
        btn.style.fontSize = '12px';
        btn.style.lineHeight = '1';
        btn.style.cursor = 'pointer';
        return btn;
      },
      onCellClicked: (e: any) => {
        const target = e.event?.target as HTMLElement | null;
        const btn = target?.closest?.('button[data-action="delete"]') as HTMLButtonElement | null;
        if (!btn) return;
        const rowId = e.data?.id;
        if (typeof rowId === 'string' && rowId) props.onDeleteRow(rowId);
      },
    });

    return defs;
  }, [props.columns, props.columnWidths, props.onDeleteRow]);

  const onGridReady = (event: GridReadyEvent) => {
    gridApiRef.current = event.api as any;
  };

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
      const last = api.getLastDisplayedRow?.();
      if (typeof last !== 'number') return;
      if (last >= props.rows.length - 10) {
        props.onLoadMore({ reset: false });
      }
    };

    api.addEventListener?.('bodyScroll', onScroll);
    return () => {
      api.removeEventListener?.('bodyScroll', onScroll);
    };
  }, [props.loadingRows, props.hasMore, props.rows.length, props.onLoadMore]);

  return (
    <div
      className={props.isFullscreen ? 'h-full' : undefined}
      style={{ width: '100%', height: props.isFullscreen ? '100%' : '70vh', minHeight: props.isFullscreen ? undefined : 520 }}
    >
      <div className="ag-theme-quartz" style={{ width: '100%', height: '100%' }}>
        {headerCssRules ? <style>{headerCssRules}</style> : null}
        <AgGridReact<CustomTableGridRow>
          rowData={props.rows}
          getRowId={(p) => p.data.id}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onCellValueChanged={onCellValueChanged}
          onColumnResized={onColumnResized}
          animateRows={false}
          suppressRowClickSelection={true}
          headerHeight={42}
          rowHeight={38}
          domLayout="normal"
        />
      </div>
    </div>
  );
}
