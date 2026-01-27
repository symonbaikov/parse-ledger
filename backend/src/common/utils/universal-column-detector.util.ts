/**
 * Universal column detector supporting multiple formats
 * Uses statistical analysis and machine learning for robust column type detection
 */

import { Injectable, Logger } from '@nestjs/common';
import { AdaptiveTableDetector, DetectedTable } from './adaptive-table-detector.util';
import { AlignmentClusterService } from './alignment-clustering.util';
import { FeatureFlagService } from './feature-flags.util';
import { detectFieldType, getLanguagePatterns } from './language-patterns.util';

export type ColumnDetectionFormat = 'csv' | 'tsv' | 'xlsx' | 'pdf' | 'html' | 'text';

export interface ColumnDetectionResult {
  columns: ColumnMapping[];
  confidence: number;
  method: 'statistical' | 'ml' | 'hybrid' | 'pattern';
  quality: DetectionQuality;
  format: ColumnDetectionFormat;
}

export interface ColumnMapping {
  index: number;
  type: string; // 'date', 'amount', 'description', etc.
  name: string; // Original header name
  confidence: number; // 0-1
  synonyms: string[];
  detectedFormat: string;
}

export interface DetectionQuality {
  headerConsistency: number; // 0-1
  contentAnalysis: number; // 0-1
  patternConfidence: number; // 0-1
  languageSupport: number; // 0-1
  overall: number; // 0-1
}

export interface FormatAnalysis {
  delimiter: string;
  lineEnding: string;
  quoteChar: string;
  hasHeaders: boolean;
  estimatedColumns: number;
  dataDensity: number;
  encoding: string;
}

@Injectable()
export class UniversalColumnDetector {
  private readonly logger = new Logger(UniversalColumnDetector.name);

  constructor(
    private featureFlagService: FeatureFlagService,
    private adaptiveTableDetector: AdaptiveTableDetector,
    private alignmentClusterService: AlignmentClusterService,
  ) {}

  /**
   * Detect columns across multiple formats with fallback strategies
   */
  async detectColumns(
    data: string[],
    options: {
      format?: ColumnDetectionFormat;
      language?: string;
      maxColumns?: number;
      strictMode?: boolean;
      autoFix?: boolean;
    } = {},
  ): Promise<ColumnDetectionResult> {
    const format = options.format || this.detectFormat(data);
    const language = options.language || 'en';

    // Step 1: Format analysis
    const formatAnalysis = this.analyzeFormat(data, format);

    // Step 2: Try ML-based detection first (if enabled)
    let mlResult: ColumnDetectionResult | null = null;
    if (this.featureFlagService.isMLEnabled('classification')) {
      mlResult = await this.detectColumnsWithML(data, format, language);
    }

    // Step 3: Statistical analysis
    const statisticalResult = this.detectColumnsWithStatistics(data, format, language);

    // Step 4: Pattern-based detection
    const patternResult = this.detectColumnsWithPatterns(data, format, language);

    // Step 5: Hybrid approach with scoring
    const hybridResult = this.combineDetectionResults(
      mlResult,
      statisticalResult,
      patternResult,
      options,
    );

    // Step 6: Auto-fix if enabled
    let finalResult = hybridResult;
    if (options.autoFix && this.featureFlagService.isFallbackEnabled('permissive')) {
      finalResult = this.autoFixColumns(finalResult, data, format, language);
    }

    // Step 7: Quality assessment
    const quality = this.assessDetectionQuality(finalResult, data, format, language);

    this.logger.log(
      `Column detection completed: ${finalResult.columns.length} columns, method: ${finalResult.method}, confidence: ${finalResult.confidence.toFixed(3)}`,
    );

    return {
      ...finalResult,
      quality,
    };
  }

  /**
   * Detect format from data characteristics
   */
  private detectFormat(data: string[]): ColumnDetectionFormat {
    if (data.length === 0) return 'text';

    const sample = data.slice(0, Math.min(100, data.length));
    const flatSample = sample.join(' ').substring(0, 1000);

    // Check for CSV patterns
    if (this.hasCSVPattern(flatSample)) {
      return this.detectCSVVariant(flatSample);
    }

    // Check for HTML patterns
    if (this.hasHTMLPattern(flatSample)) {
      return 'html';
    }

    // Check for table-like structure
    if (this.hasTableStructure(sample)) {
      return this.analyzeTableStructure(sample);
    }

    // Check for PDF-like content
    if (this.hasPDFMarkers(flatSample)) {
      return 'pdf';
    }

    return 'text';
  }

  /**
   * Detect CSV variant (CSV vs TSV)
   */
  private detectCSVVariant(sample: string): 'csv' | 'tsv' {
    const semicolonCount = (sample.match(/;/g) || []).length;
    const commaCount = (sample.match(/,/g) || []).length;
    const tabCount = (sample.match(/\t/g) || []).length;

    if (tabCount > commaCount && tabCount > semicolonCount) {
      return 'tsv';
    }
    return 'csv';
  }

  /**
   * Check for CSV-like patterns
   */
  private hasCSVPattern(sample: string): boolean {
    // Look for comma or tab separated values with consistent structure
    const lines = sample.split('\n').slice(0, 10);

    for (const line of lines) {
      const fields = line.split(/[,\t]/);
      if (fields.length >= 3) {
        // Check if fields look like data (not just text)
        const hasNumeric = fields.some(field => /-?\d+\.?\d*/.test(field.trim()));
        const hasDate = fields.some(field =>
          /\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}/.test(field.trim()),
        );

        if (hasNumeric || hasDate) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for HTML-like patterns
   */
  private hasHTMLPattern(sample: string): boolean {
    return /<table|<tr|<td|<th|<html|<body/i.test(sample);
  }

  /**
   * Calculate mode of an array
   */
  private calculateMode(values: number[]): number {
    const frequency: Record<string, number> = {};

    for (const value of values) {
      frequency[value] = (frequency[value] || 0) + 1;
    }

    let mode = values[0] ?? 0;
    let maxCount = 0;

    for (const [value, count] of Object.entries(frequency)) {
      if (count > maxCount) {
        maxCount = count;
        mode = Number(value);
      }
    }

    return mode;
  }

  /**
   * Check for table-like structure
   */
  private hasTableStructure(sample: string[]): boolean {
    // Simple heuristic: multiple lines with repeating separators
    const lines = sample.slice(0, 5);
    let separatorPattern: string | null = null;

    for (const line of lines) {
      const separators = line.match(/[,\t|]/g);
      if (separators && separators.length >= 2) {
        separatorPattern = line;
        break;
      }
    }

    return !!separatorPattern;
  }

  /**
   * Check for PDF markers
   */
  private hasPDFMarkers(sample: string): boolean {
    const pdfMarkers = [
      /page\s+\d+/gi,
      /font\s+size/gi,
      /rect\s*\[/gi,
      /stream/gi,
      /endobj/gi,
      /%%EOF/gi,
    ];

    return pdfMarkers.some(marker => marker.test(sample));
  }

  /**
   * Analyze table structure to guess format
   */
  private analyzeTableStructure(sample: string[]): ColumnDetectionFormat {
    const combined = sample.join(' ');
    // Look for Excel-like patterns
    if (/sheet\d+/gi.test(combined) || /cell\s+[A-Z]+\d+/gi.test(combined)) {
      return 'xlsx';
    }

    // Look for table markers
    if (/table[^>]*>/gi.test(combined)) {
      return 'html';
    }

    return 'pdf';
  }

  /**
   * Analyze format characteristics
   */
  private analyzeFormat(data: string[], format: ColumnDetectionFormat): FormatAnalysis {
    const sample = data.slice(0, Math.min(50, data.length)).join('\n');

    let delimiter = ',';
    let lineEnding = '\n';
    let quoteChar = '"';
    let hasHeaders = false;

    if (format === 'csv' || format === 'tsv') {
      delimiter = format === 'tsv' ? '\t' : ',';

      // Detect line ending
      const crlfCount = (sample.match(/\r\n/g) || []).length;
      const lfCount = (sample.match(/[^\r]\n/g) || []).length;
      lineEnding = crlfCount > lfCount ? '\r\n' : '\n';

      // Detect quote character
      const doubleQuoteCount = (sample.match(/"/g) || []).length;
      const singleQuoteCount = (sample.match(/'/g) || []).length;
      quoteChar = doubleQuoteCount >= singleQuoteCount ? '"' : "'";

      // Detect headers
      hasHeaders = this.detectHeaders(data.slice(0, 5), delimiter);
    }

    return {
      delimiter,
      lineEnding,
      quoteChar,
      hasHeaders,
      estimatedColumns: this.estimateColumnCount(data, delimiter),
      dataDensity: this.calculateDataDensity(data),
      encoding: 'utf-8', // Default assumption
    };
  }

  /**
   * Detect if first rows contain headers
   */
  private detectHeaders(rows: string[], delimiter: string): boolean {
    if (rows.length < 2) return false;

    const firstRow = rows[0].split(delimiter);
    const secondRow = rows[1].split(delimiter);

    if (firstRow.length !== secondRow.length) return false;

    // Check if first row contains more text/alphabetic characters than second row
    const firstRowTextScore = firstRow
      .join('')
      .replace(/[^a-zA-Z\u00C0-\u017F\u0400-\u04FF]/g, '').length;
    const secondRowTextScore = secondRow
      .join('')
      .replace(/[^a-zA-Z\u00C0-\u017F\u0400-\u04FF]/g, '').length;

    return firstRowTextScore > secondRowTextScore * 1.5;
  }

  /**
   * Estimate column count from data
   */
  private estimateColumnCount(data: string[], delimiter: string): number {
    if (data.length === 0) return 0;

    const sample = data.slice(0, Math.min(10, data.length));
    const columnCounts = sample.map(row => row.split(delimiter).length);

    return Math.round(columnCounts.reduce((sum, count) => sum + count, 0) / columnCounts.length);
  }

  /**
   * Calculate data density
   */
  private calculateDataDensity(data: string[]): number {
    if (data.length === 0) return 0;

    const totalChars = data.join('').length;
    const nonWhitespaceChars = data.join('').replace(/\s/g, '').length;

    return totalChars > 0 ? nonWhitespaceChars / totalChars : 0;
  }

  /**
   * ML-based column detection (placeholder for future implementation)
   */
  private async detectColumnsWithML(
    data: string[],
    format: ColumnDetectionFormat,
    language: string,
  ): Promise<ColumnDetectionResult> {
    // This would integrate with ML models for classification
    // For now, return a simple pattern-based result

    const columns = this.detectColumnsWithPatterns(data, format, language);

    return {
      ...columns,
      method: 'ml',
      confidence: 0.6, // ML would have higher confidence
      format,
    };
  }

  /**
   * Statistical column detection
   */
  private detectColumnsWithStatistics(
    data: string[],
    format: ColumnDetectionFormat,
    language: string,
  ): ColumnDetectionResult {
    const delimiter = format === 'tsv' ? '\t' : ',';
    const headersRow = data.find(row => this.looksLikeHeader(row, delimiter));

    if (!headersRow) {
      // Fallback to first non-empty row
      const firstNonEmptyRow = data.find(row => row.trim().length > 0);
      if (firstNonEmptyRow) {
        return this.createColumnDetectionFromRow(
          firstNonEmptyRow,
          delimiter,
          'statistical',
          format,
          language,
        );
      }

      return this.createEmptyResult(format, language);
    }

    return this.createColumnDetectionFromRow(
      headersRow,
      delimiter,
      'statistical',
      format,
      language,
    );
  }

  /**
   * Pattern-based column detection
   */
  private detectColumnsWithPatterns(
    data: string[],
    format: ColumnDetectionFormat,
    language: string,
  ): ColumnDetectionResult {
    const delimiter = format === 'tsv' ? '\t' : ',';
    const patterns = getLanguagePatterns(language);

    // Try to find header row with recognizable patterns
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      const columns = this.createColumnDetectionFromRow(
        row,
        delimiter,
        'pattern',
        format,
        language,
      );

      // Check if we found meaningful column types
      const meaningfulTypes = columns.columns.filter(
        col => col.type !== 'unknown' && col.confidence > 0.3,
      );

      if (meaningfulTypes.length >= 3) {
        return {
          ...columns,
          format,
          confidence: columns.confidence,
        };
      }
    }

    return this.createEmptyResult(format, language);
  }

  /**
   * Create column detection from a single row
   */
  private createColumnDetectionFromRow(
    row: string,
    delimiter: string,
    method: 'statistical' | 'pattern',
    format: ColumnDetectionFormat,
    language: string,
  ): ColumnDetectionResult {
    const headers = row.split(delimiter);
    const patterns = getLanguagePatterns(language);
    const fieldEntries = Object.entries(patterns.fieldSynonyms) as Array<[string, string[]]>;

    const colMapping: ColumnMapping[] = headers.map((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();

      // Try to match with known patterns
      for (const [fieldType, synonyms] of fieldEntries) {
        for (const synonym of synonyms) {
          if (
            normalizedHeader.includes(synonym.toLowerCase()) ||
            synonym.toLowerCase().includes(normalizedHeader)
          ) {
            return {
              index,
              type: fieldType,
              name: header.trim(),
              confidence: this.calculateFieldConfidence(normalizedHeader, synonym),
              synonyms,
              detectedFormat: normalizedHeader,
            };
          }
        }
      }

      // Fallback to generic detection
      const fieldType = this.inferFieldTypeFromContent(header);
      return {
        index,
        type: fieldType,
        name: header.trim(),
        confidence: fieldType !== 'unknown' ? 0.3 : 0.1,
        synonyms: [fieldType],
        detectedFormat: normalizedHeader,
      };
    });

    const confidence = this.calculateOverallConfidence(colMapping);

    return {
      columns: colMapping,
      confidence,
      method,
      quality: this.createDefaultQuality(confidence),
      format,
    };
  }

  /**
   * Check if a row looks like headers
   */
  private looksLikeHeader(row: string, delimiter: string): boolean {
    const fields = row.split(delimiter);

    // Headers typically have more text and fewer numbers
    const textFields = fields.filter(field => /[a-zA-Z\u00C0-\u017F\u0400-\u04FF]/.test(field));
    const numericFields = fields.filter(field => /\d/.test(field));

    return textFields.length > numericFields.length && textFields.length >= 2;
  }

  /**
   * Infer field type from content analysis
   */
  private inferFieldTypeFromContent(content: string): string {
    const normalized = content.toLowerCase().trim();

    if (normalized.length === 0) return 'unknown';

    // Date detection
    if (/\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4}/.test(normalized)) {
      return 'date';
    }

    // Amount detection
    if (/^-?\$?\s*\d+\.?\d*\s*$/.test(normalized) || /\d+\.?\d*\s*$/.test(normalized)) {
      return 'amount';
    }

    // Description detection (longer text fields)
    if (normalized.length > 20) {
      return 'description';
    }

    // Counterparty detection (names, companies)
    if (/(company|corp|ltd|inc|gmbh|bank)/.test(normalized)) {
      return 'counterparty';
    }

    return 'unknown';
  }

  /**
   * Calculate field confidence based on match quality
   */
  private calculateFieldConfidence(normalizedHeader: string, matchedPattern: string): number {
    if (normalizedHeader === matchedPattern.toLowerCase()) {
      return 1.0; // Perfect match
    }

    if (normalizedHeader.includes(matchedPattern.toLowerCase())) {
      return 0.8; // Contains pattern
    }

    if (matchedPattern.toLowerCase().includes(normalizedHeader)) {
      return 0.6; // Pattern contains header
    }

    return 0.3; // Weak match
  }

  /**
   * Calculate overall confidence for column detection
   */
  private calculateOverallConfidence(colMapping: ColumnMapping[]): number {
    if (colMapping.length === 0) return 0;

    const confidenceValues = colMapping.map(col => col.confidence);
    return confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
  }

  /**
   * Combine results from multiple detection methods
   */
  private combineDetectionResults(
    mlResult: ColumnDetectionResult | null,
    statisticalResult: ColumnDetectionResult,
    patternResult: ColumnDetectionResult,
    options: any,
  ): ColumnDetectionResult {
    const results = [mlResult, statisticalResult, patternResult].filter(Boolean);

    if (results.length === 0) {
      return this.createEmptyResult('text', 'en');
    }

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);

    let bestResult = results[0];
    const bestMethod = bestResult.method;

    // Hybrid approach: enhance best result with insights from others
    if (results.length > 1) {
      bestResult = this.enhanceWithHybridApproach(bestResult, results.slice(1));
      bestResult.method = 'hybrid';
    }

    // Apply strict mode constraints
    if (options.strictMode && bestResult.confidence < 0.7) {
      // Fallback to pattern result in strict mode
      const patternFallback = results.find(r => r.method === 'pattern');
      if (patternFallback) {
        bestResult = patternFallback;
        bestResult.method = 'pattern';
      }
    }

    return bestResult;
  }

  /**
   * Enhance detection result with hybrid approach
   */
  private enhanceWithHybridApproach(
    bestResult: ColumnDetectionResult,
    otherResults: ColumnDetectionResult[],
  ): ColumnDetectionResult {
    // Merge column insights from other methods
    const mergedColumns = bestResult.columns.map(bestCol => {
      // Find corresponding columns in other results
      const otherCols = otherResults
        .flatMap(r => r.columns)
        .filter(otherCol => otherCol.index === bestCol.index);

      // If other methods suggest different types, reduce confidence
      const otherTypes = new Set(otherCols.map(col => col.type));
      otherTypes.delete(bestCol.type);

      if (otherTypes.size > 0) {
        bestCol.confidence *= 0.8; // Reduce confidence due to conflicts
      }

      return bestCol;
    });

    return {
      ...bestResult,
      columns: mergedColumns,
    };
  }

  private createDefaultQuality(confidence: number): DetectionQuality {
    const clamped = Math.max(0, Math.min(1, confidence));
    return {
      headerConsistency: clamped,
      contentAnalysis: clamped,
      patternConfidence: clamped,
      languageSupport: 0.6,
      overall: clamped,
    };
  }

  /**
   * Create empty result
   */
  private createEmptyResult(
    format: ColumnDetectionFormat,
    language: string,
  ): ColumnDetectionResult {
    return {
      columns: [],
      confidence: 0,
      method: 'pattern',
      quality: {
        headerConsistency: 0,
        contentAnalysis: 0,
        patternConfidence: 0,
        languageSupport: 0,
        overall: 0,
      },
      format,
    };
  }

  /**
   * Auto-fix common column detection issues
   */
  private autoFixColumns(
    result: ColumnDetectionResult,
    data: string[],
    format: string,
    language: string,
  ): ColumnDetectionResult {
    const fixedColumns = result.columns.map(col => {
      const fixedCol = { ...col };

      // Fix missing columns by adding common ones
      if (result.columns.length < 5 && !result.columns.some(c => c.type === 'date')) {
        const dateCol: ColumnMapping = {
          index: result.columns.length,
          type: 'date',
          name: 'Date',
          confidence: 0.5,
          synonyms: ['date', 'transaction date'],
          detectedFormat: 'auto-added',
        };
        result.columns.push(dateCol);
      }

      if (result.columns.length < 6 && !result.columns.some(c => c.type === 'amount')) {
        const amountCol: ColumnMapping = {
          index: result.columns.length,
          type: 'amount',
          name: 'Amount',
          confidence: 0.5,
          synonyms: ['amount', 'sum', 'total'],
          detectedFormat: 'auto-added',
        };
        result.columns.push(amountCol);
      }

      return fixedCol;
    });

    return {
      ...result,
      columns: fixedColumns,
    };
  }

  /**
   * Assess detection quality
   */
  private assessDetectionQuality(
    result: ColumnDetectionResult,
    data: string[],
    format: string,
    language: string,
  ): DetectionQuality {
    const headerConsistency = this.calculateHeaderConsistency(result.columns, data);
    const contentAnalysis = this.analyzeDataContent(data, result.columns);
    const patternConfidence = result.confidence;
    const languageSupport = language !== 'en' ? 0.8 : 0.6; // Better support for English

    const overall = (headerConsistency + contentAnalysis + patternConfidence + languageSupport) / 4;

    return {
      headerConsistency,
      contentAnalysis,
      patternConfidence,
      languageSupport,
      overall,
    };
  }

  /**
   * Calculate header consistency
   */
  private calculateHeaderConsistency(columns: ColumnMapping[], data: string[]): number {
    if (columns.length === 0 || data.length === 0) return 0;

    // Check if detected columns work well with the data
    const sampleRows = data.slice(0, Math.min(10, data.length));
    const consistencyScore = 0;
    let validRows = 0;

    for (const row of sampleRows) {
      const fields = row.split(/[,;\t]/);
      if (fields.length === columns.length) {
        validRows++;
      }
    }

    return validRows / sampleRows.length;
  }

  /**
   * Analyze data content for quality assessment
   */
  private analyzeDataContent(data: string[], columns: ColumnMapping[]): number {
    if (data.length === 0 || columns.length === 0) return 0;

    const sampleSize = Math.min(100, data.length);
    const sample = data.slice(0, sampleSize);

    // Check for data density and structure
    let structureScore = 0;

    for (const row of sample) {
      const fields = row.split(/[,;\t]/);

      // Reward well-structured rows
      if (fields.length === columns.length && fields.every(f => f.trim().length > 0)) {
        structureScore += 1;
      }
    }

    return Math.min(1, structureScore / sampleSize);
  }
}
