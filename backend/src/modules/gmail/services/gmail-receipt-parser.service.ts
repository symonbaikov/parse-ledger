import * as fs from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class GmailReceiptParserService {
  private readonly logger = new Logger(GmailReceiptParserService.name);

  async parseReceipt(filePath: string): Promise<any> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = this.getMimeType(filePath);

      if (mimeType === 'application/pdf') {
        return await this.parsePdfReceipt(fileBuffer);
      }

      // For now, return basic metadata for non-PDF files
      return {
        confidence: 0.5,
        extracted: false,
      };
    } catch (error) {
      this.logger.error('Failed to parse receipt', error);
      return null;
    }
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private async parsePdfReceipt(buffer: Buffer): Promise<any> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      // Enhanced extraction logic
      const amount = this.extractAmount(text);
      const date = this.extractDate(text);
      const vendor = this.extractVendor(text);
      const tax = this.extractTax(text);
      const lineItems = this.extractLineItems(text);

      // Calculate subtotal if tax is found
      let subtotal: number | undefined;
      let taxRate: number | undefined;
      if (amount && tax) {
        subtotal = amount - tax;
        taxRate = (tax / subtotal) * 100;
      }

      // Calculate confidence score
      const confidence = this.calculateConfidence({
        amount,
        date,
        vendor,
        tax,
        lineItems,
      });

      return {
        amount,
        currency: 'KZT',
        date,
        vendor,
        tax,
        taxRate,
        subtotal,
        lineItems,
        confidence,
      };
    } catch (error) {
      this.logger.error('Failed to parse PDF receipt', error);
      return null;
    }
  }

  private extractAmount(text: string): number | undefined {
    // Look for common amount patterns
    const patterns = [
      /total[:\s]+(\d+[\s,.]?\d*)/i,
      /amount[:\s]+(\d+[\s,.]?\d*)/i,
      /sum[:\s]+(\d+[\s,.]?\d*)/i,
      /₸\s*(\d+[\s,.]?\d*)/,
      /(\d+[\s,.]?\d*)\s*₸/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const numStr = match[1].replace(/[\s,]/g, '');
        const num = Number.parseFloat(numStr);
        if (!Number.isNaN(num)) {
          return num;
        }
      }
    }

    return undefined;
  }

  private extractDate(text: string): string | undefined {
    // Look for date patterns
    const patterns = [/\d{2}[-/.]\d{2}[-/.]\d{4}/, /\d{4}[-/.]\d{2}[-/.]\d{2}/];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  private extractVendor(text: string): string | undefined {
    // Extract first line (often the vendor name)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      return lines[0].trim().slice(0, 100);
    }
    return undefined;
  }

  private extractTax(text: string): number | undefined {
    // Look for tax patterns
    const patterns = [
      /tax[:\s]+(\d+[\s,.]?\d*)/i,
      /vat[:\s]+(\d+[\s,.]?\d*)/i,
      /НДС[:\s]+(\d+[\s,.]?\d*)/i,
      /налог[:\s]+(\d+[\s,.]?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const numStr = match[1].replace(/[\s,]/g, '');
        const num = Number.parseFloat(numStr);
        if (!Number.isNaN(num)) {
          return num;
        }
      }
    }

    return undefined;
  }

  private extractLineItems(text: string): Array<{ description: string; amount: number }> {
    const lineItems: Array<{ description: string; amount: number }> = [];
    const lines = text.split('\n');

    // Look for lines with item description followed by amount
    const itemPattern = /^(.+?)\s+(\d+[\s,.]?\d*)\s*₸?$/;

    for (const line of lines) {
      const match = line.trim().match(itemPattern);
      if (match) {
        const description = match[1].trim();
        const numStr = match[2].replace(/[\s,]/g, '');
        const amount = Number.parseFloat(numStr);

        if (!Number.isNaN(amount) && description.length > 0 && description.length < 200) {
          lineItems.push({ description, amount });
        }
      }
    }

    return lineItems.length > 0 ? lineItems : [];
  }

  private calculateConfidence(data: {
    amount?: number;
    date?: string;
    vendor?: string;
    tax?: number;
    lineItems?: Array<any>;
  }): number {
    let confidence = 0;

    if (data.amount) confidence += 30;
    if (data.date) confidence += 20;
    if (data.vendor) confidence += 20;
    if (data.tax) confidence += 15;
    if (data.lineItems && data.lineItems.length > 0) confidence += 15;

    return confidence / 100;
  }
}
