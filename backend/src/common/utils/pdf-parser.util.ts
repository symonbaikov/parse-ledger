import * as fs from 'fs';
const pdfParse = require('pdf-parse');
const pdf2table = require('pdf2table');

/**
 * Extract text from PDF file using pdf-parse library
 * @param filePath Path to PDF file
 * @returns Promise that resolves to extracted text
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('[PDF Parser] Error extracting text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface PdfTextRow {
  page: number;
  y: number;
  text: string;
  items: PdfTextItem[];
}

export interface PdfTableRowCell {
  text: string;
  x: number;
}

export interface PdfTableRow {
  page: number;
  y: number;
  columns: string[];
  cells: PdfTableRowCell[];
}

/**
 * Extract text with basic layout information (coordinates) to help rebuild tables.
 * Falls back to raw text extraction if layout parsing fails.
 */
export async function extractTextAndLayoutFromPdf(
  filePath: string,
): Promise<{ text: string; rows: PdfTextRow[] }> {
  const collectedItems: PdfTextItem[] = [];
  let pageNumber = 0;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer, {
      pagerender: async (pageData: any) => {
        pageNumber += 1;
        const textContent = await pageData.getTextContent({
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        });

        let assembled = '';
        let lastY: number | null = null;

        textContent.items.forEach((item: any) => {
          if (!item?.str || !item.transform) {
            return;
          }

          const x = item.transform[4];
          const y = item.transform[5];

          collectedItems.push({
            text: item.str,
            x,
            y,
            width: item.width || 0,
            height: item.height || 0,
            page: pageNumber,
          });

          if (lastY === null || Math.abs(lastY - y) < 0.5) {
            assembled += item.str;
          } else {
            assembled += '\n' + item.str;
          }
          lastY = y;
        });

        return assembled;
      },
    });

    const rows = groupItemsIntoRows(collectedItems);

    return { text: data.text, rows };
  } catch (error) {
    console.error('[PDF Parser] Error extracting layout-aware text:', error);
    // Fall back to simple text extraction
    return { text: await extractTextFromPdf(filePath), rows: [] };
  }
}

function groupItemsIntoRows(items: PdfTextItem[]): PdfTextRow[] {
  if (!items.length) {
    return [];
  }

  const sorted = [...items].sort((a, b) => {
    if (a.page !== b.page) {
      return a.page - b.page;
    }
    if (b.y !== a.y) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const rows: PdfTextRow[] = [];
  const tolerance = 2.5;

  for (const item of sorted) {
    let row = rows.find(
      (r) => r.page === item.page && Math.abs(r.y - item.y) < tolerance,
    );

    if (!row) {
      row = { page: item.page, y: item.y, items: [], text: '' };
      rows.push(row);
    }

    row.items.push(item);
  }

  rows.forEach((row) => {
    row.items.sort((a, b) => a.x - b.x);
    row.text = row.items
      .map((i) => i.text.trim())
      .filter((t) => t.length > 0)
      .join(' ');
  });

  return rows.sort((a, b) => {
    if (a.page !== b.page) {
      return a.page - b.page;
    }
    return b.y - a.y;
  });
}

/**
 * Extract table-like rows from PDF using pdf2table.
 * Returns both simple rows (array of cell values) and structured rows with coordinates.
 */
export async function extractTablesFromPdf(
  filePath: string,
): Promise<{ rows: string[][]; structured: PdfTableRow[] }> {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const { rows, structuredRows } = await new Promise<{
      rows: string[][];
      structuredRows: PdfTableRow[];
    }>((resolve, reject) => {
      pdf2table.parse(
        dataBuffer,
        (err: Error | null, simpleRows: string[][], pages: any[]) => {
          if (err) {
            return reject(err);
          }

          const structuredRows: PdfTableRow[] = [];

          (pages || []).forEach((pageRows: any[], pageIndex: number) => {
            if (!Array.isArray(pageRows)) {
              return;
            }

            pageRows.forEach((row) => {
              const cells = Array.isArray(row?.data) ? row.data : [];
              structuredRows.push({
                page: pageIndex + 1,
                y: typeof row?.y === 'number' ? row.y : 0,
                columns: cells.map((cell: any) => (cell?.text ?? '').toString()),
                cells: cells.map((cell: any) => ({
                  text: (cell?.text ?? '').toString(),
                  x: typeof cell?.x === 'number' ? cell.x : 0,
                })),
              });
            });
          });

          resolve({
            rows: simpleRows || [],
            structuredRows,
          });
        },
      );
    });

    return { rows, structured: structuredRows };
  } catch (error) {
    console.error('[PDF Parser] Error extracting tables:', error);
    return { rows: [], structured: [] };
  }
}
