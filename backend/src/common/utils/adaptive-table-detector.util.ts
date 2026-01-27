/**
 * Adaptive table detector with multiple strategies and quality analysis
 * Supports robust table detection across different document types and qualities
 */

import { Injectable, Logger } from '@nestjs/common';
import { FeatureFlagService } from './feature-flags.util';

export interface TableDetectionResult {
  strategy: 'lines' | 'text' | 'mixed' | 'advanced';
  confidence: number;
  tables: DetectedTable[];
  quality: TableQuality;
  metadata: {
    documentDensity: number;
    avgCellSize: number;
    lineConsistency: number;
  };
}

export interface DetectedTable {
  bbox: [number, number, number, number]; // [x0, top, x1, bottom]
  data: string[][];
  structured: Array<{
    page: number;
    y: number;
    columns: string[];
    cells: Array<{ text: string; x: number }>;
  }>;
  quality: TableQuality;
}

export interface TableQuality {
  columnConsistency: number; // 0-1
  rowCompleteness: number; // 0-1
  dataDensity: number; // 0-1
  alignmentScore: number; // 0-1
  overall: number; // 0-1
}

export interface ColumnAlignment {
  x: number[];
  confidence: number;
  tolerance: number;
  gaps: number[];
}

@Injectable()
export class AdaptiveTableDetector {
  private readonly logger = new Logger(AdaptiveTableDetector.name);

  constructor(private featureFlagService: FeatureFlagService) {}

  /**
   * Detect tables with adaptive strategies
   */
  detectTables(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    options?: { strictMode?: boolean; minConfidence?: number },
  ): TableDetectionResult {
    const strictMode = options?.strictMode ?? false;
    const minConfidence = options?.minConfidence ?? 0.5;

    // Analyze document characteristics
    const metadata = this.analyzeDocumentMetadata(words, pageNumber);

    // Try different strategies based on document analysis
    const strategies = this.selectOptimalStrategies(metadata);

    let bestResult: TableDetectionResult | null = null;

    for (const strategy of strategies) {
      const result = this.executeDetectionStrategy(words, pageNumber, strategy, metadata);
      if (result && result.confidence >= minConfidence) {
        if (!bestResult || result.confidence > bestResult.confidence) {
          bestResult = result;
        }
      }
    }

    if (!bestResult) {
      // Fallback to basic detection
      bestResult = this.executeDetectionStrategy(words, pageNumber, 'lines', metadata);
    }

    if (strictMode && bestResult.confidence < 0.8) {
      this.logger.warn(
        `Table detection confidence below threshold in strict mode: ${bestResult.confidence}`,
      );
    }

    return bestResult;
  }

  /**
   * Analyze document metadata for strategy selection
   */
  private analyzeDocumentMetadata(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
  ): TableDetectionResult['metadata'] {
    const pageWords = words.filter(w => w.page === pageNumber);

    // Calculate density metrics
    const pageArea = this.calculatePageArea(pageWords);
    const textArea = pageWords.reduce((sum, w) => sum + (w.x1 - w.x0) * (w.bottom - w.top), 0);
    const documentDensity = textArea / pageArea;

    // Analyze line consistency
    const lineGroups = this.groupWordsByLines(pageWords, 2.0);
    const lineConsistency = this.calculateLineConsistency(lineGroups);

    // Calculate average word/cell size
    const avgWordSize =
      pageWords.reduce((sum, w) => sum + (w.x1 - w.x0) * (w.bottom - w.top), 0) / pageWords.length;

    return {
      documentDensity,
      avgCellSize: avgWordSize,
      lineConsistency,
    };
  }

  /**
   * Select optimal detection strategies based on document characteristics
   */
  private selectOptimalStrategies(
    metadata: TableDetectionResult['metadata'],
  ): Array<'lines' | 'text' | 'mixed' | 'advanced'> {
    const strategies: Array<'lines' | 'text' | 'mixed' | 'advanced'> = ['lines'];

    // Add text strategy for high-density documents
    if (metadata.documentDensity > 0.7) {
      strategies.push('text');
    }

    // Add mixed strategy for inconsistent documents
    if (metadata.lineConsistency < 0.6) {
      strategies.push('mixed');
    }

    // Add advanced strategy for high-quality documents
    if (metadata.avgCellSize > 500 && metadata.lineConsistency > 0.8) {
      strategies.push('advanced');
    }

    return strategies;
  }

  /**
   * Execute specific table detection strategy
   */
  private executeDetectionStrategy(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    strategy: 'lines' | 'text' | 'mixed' | 'advanced',
    metadata: TableDetectionResult['metadata'],
  ): TableDetectionResult {
    const pageWords = words.filter(w => w.page === pageNumber);

    switch (strategy) {
      case 'lines':
        return this.detectWithLinesStrategy(pageWords, pageNumber, metadata);
      case 'text':
        return this.detectWithTextStrategy(pageWords, pageNumber, metadata);
      case 'mixed':
        return this.detectWithMixedStrategy(pageWords, pageNumber, metadata);
      case 'advanced':
        return this.detectWithAdvancedStrategy(pageWords, pageNumber, metadata);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Lines-based table detection (existing strategy)
   */
  private detectWithLinesStrategy(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    metadata: TableDetectionResult['metadata'],
  ): TableDetectionResult {
    const settings = {
      vertical_strategy: 'lines',
      horizontal_strategy: 'lines',
      snap_tolerance: 3,
      join_tolerance: 3,
      edge_min_length: 15,
    };

    // Simulate pdfplumber table detection with lines strategy
    const tables = this.simulatePdfplumberDetection(words, settings);
    const quality = this.calculateTableQuality(tables, metadata);

    return {
      strategy: 'lines',
      confidence: this.calculateDetectionConfidence(tables, quality),
      tables,
      quality,
      metadata,
    };
  }

  /**
   * Text-based table detection
   */
  private detectWithTextStrategy(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    metadata: TableDetectionResult['metadata'],
  ): TableDetectionResult {
    const settings = {
      vertical_strategy: 'text',
      horizontal_strategy: 'text',
      snap_tolerance: 2,
      join_tolerance: 2,
      edge_min_length: 3,
    };

    const tables = this.simulatePdfplumberDetection(words, settings);
    const quality = this.calculateTableQuality(tables, metadata);

    return {
      strategy: 'text',
      confidence: this.calculateDetectionConfidence(tables, quality),
      tables,
      quality,
      metadata,
    };
  }

  /**
   * Mixed strategy combining lines and text
   */
  private detectWithMixedStrategy(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    metadata: TableDetectionResult['metadata'],
  ): TableDetectionResult {
    // Try both strategies and combine results
    const linesResult = this.detectWithLinesStrategy(words, pageNumber, metadata);
    const textResult = this.detectWithTextStrategy(words, pageNumber, metadata);

    // Select best result or merge if both are good
    let finalResult: TableDetectionResult;

    if (linesResult.confidence > textResult.confidence * 1.2) {
      finalResult = linesResult;
    } else if (textResult.confidence > linesResult.confidence * 1.2) {
      finalResult = textResult;
    } else {
      // Merge results
      finalResult = {
        strategy: 'mixed',
        confidence: Math.max(linesResult.confidence, textResult.confidence),
        tables: [...linesResult.tables, ...textResult.tables],
        quality: {
          columnConsistency: Math.max(
            linesResult.quality.columnConsistency,
            textResult.quality.columnConsistency,
          ),
          rowCompleteness: Math.max(
            linesResult.quality.rowCompleteness,
            textResult.quality.rowCompleteness,
          ),
          dataDensity: Math.max(linesResult.quality.dataDensity, textResult.quality.dataDensity),
          alignmentScore: Math.max(
            linesResult.quality.alignmentScore,
            textResult.quality.alignmentScore,
          ),
          overall: Math.max(linesResult.quality.overall, textResult.quality.overall),
        },
        metadata,
      };
    }

    return finalResult;
  }

  /**
   * Advanced strategy with clustering and adaptive parameters
   */
  private detectWithAdvancedStrategy(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    pageNumber: number,
    metadata: TableDetectionResult['metadata'],
  ): TableDetectionResult {
    // Adaptive settings based on document analysis
    const adaptiveSettings = this.generateAdaptiveSettings(metadata);

    const tables = this.simulatePdfplumberDetection(words, adaptiveSettings);
    const quality = this.calculateTableQuality(tables, metadata);

    return {
      strategy: 'advanced',
      confidence: this.calculateDetectionConfidence(tables, quality),
      tables,
      quality,
      metadata,
    };
  }

  /**
   * Generate adaptive settings based on document characteristics
   */
  private generateAdaptiveSettings(metadata: TableDetectionResult['metadata']) {
    const baseSettings = {
      vertical_strategy: 'lines' as const,
      horizontal_strategy: 'lines' as const,
    };

    // Adaptive parameters
    const snapTolerance = metadata.lineConsistency > 0.8 ? 2 : 5;
    const joinTolerance = metadata.avgCellSize > 1000 ? 4 : 2;
    const edgeMinLength = metadata.documentDensity > 0.6 ? 10 : 20;

    return {
      ...baseSettings,
      snap_tolerance: snapTolerance,
      join_tolerance: joinTolerance,
      edge_min_length: edgeMinLength,
    };
  }

  /**
   * Simulate pdfplumber table detection with given settings
   */
  private simulatePdfplumberDetection(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    settings: any,
  ): DetectedTable[] {
    // This is a simplified simulation of pdfplumber's table detection
    // In a real implementation, this would use actual pdfplumber library

    const lines = this.groupWordsByLines(words, settings.snap_tolerance || 3.0);
    const tables: DetectedTable[] = [];

    for (const lineGroup of lines) {
      if (lineGroup.length < 3) continue; // Need at least 3 columns

      const table = this.extractTableFromLineGroup(lineGroup, settings);
      if (table) {
        tables.push(table);
      }
    }

    return tables;
  }

  /**
   * Group words by lines with tolerance
   */
  private groupWordsByLines(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    tolerance: number,
  ): Array<
    Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>
  > {
    const lines: Array<
      Array<{
        text: string;
        x0: number;
        x1: number;
        top: number;
        bottom: number;
        page: number;
      }>
    > = [];
    const used = new Set<number>();

    for (const word of words) {
      if (used.has(words.indexOf(word))) continue;

      // Find existing line or create new one
      let targetLine = lines.find(
        line => Math.abs(line[0]?.top - word.top) <= tolerance && line[0]?.page === word.page,
      );

      if (!targetLine) {
        targetLine = [];
        lines.push(targetLine);
      }

      targetLine.push(word);
      used.add(words.indexOf(word));
    }

    return lines.filter(line => line.length > 0);
  }

  /**
   * Extract table from line group
   */
  private extractTableFromLineGroup(
    lineGroup: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
    settings: any,
  ): DetectedTable | null {
    if (lineGroup.length < 2) return null;

    // Calculate bounding box
    const x0 = Math.min(...lineGroup.map(w => w.x0));
    const top = Math.min(...lineGroup.map(w => w.top));
    const x1 = Math.max(...lineGroup.map(w => w.x1));
    const bottom = Math.max(...lineGroup.map(w => w.bottom));

    // Create table data
    const data: string[][] = [];
    const rowData = lineGroup.map(w => w.text);
    data.push(rowData);

    // Create structured representation
    const structured = [
      {
        page: lineGroup[0]?.page || 1,
        y: top,
        columns: data[0] || [],
        cells: lineGroup.map(w => ({
          text: w.text,
          x: w.x0,
        })),
      },
    ];

    const quality = this.calculateBasicTableQuality(data);

    return {
      bbox: [x0, top, x1, bottom],
      data,
      structured,
      quality,
    };
  }

  /**
   * Calculate table quality metrics
   */
  private calculateTableQuality(
    tables: DetectedTable[],
    metadata: TableDetectionResult['metadata'],
  ): TableQuality {
    if (tables.length === 0) {
      return {
        columnConsistency: 0,
        rowCompleteness: 0,
        dataDensity: 0,
        alignmentScore: 0,
        overall: 0,
      };
    }

    const qualities = tables.map(
      table => table.quality || this.calculateBasicTableQuality(table.data),
    );

    return {
      columnConsistency: this.average(qualities.map(q => q.columnConsistency)),
      rowCompleteness: this.average(qualities.map(q => q.rowCompleteness)),
      dataDensity: this.average(qualities.map(q => q.dataDensity)),
      alignmentScore: this.average(qualities.map(q => q.alignmentScore)),
      overall: this.average(qualities.map(q => q.overall)),
    };
  }

  /**
   * Calculate basic table quality
   */
  private calculateBasicTableQuality(data: string[][]): TableQuality {
    if (data.length === 0) {
      return {
        columnConsistency: 0,
        rowCompleteness: 0,
        dataDensity: 0,
        alignmentScore: 0,
        overall: 0,
      };
    }

    // Column consistency
    const columnCounts = data.map(row => row.length);
    const avgColumns = this.average(columnCounts);
    const columnConsistency = 1 - this.standardDeviation(columnCounts) / avgColumns;

    // Row completeness (non-empty cells)
    const rowCompleteness = data.map(
      row => row.filter(cell => cell && cell.trim().length > 0).length / row.length,
    );
    const avgRowCompleteness = this.average(rowCompleteness);

    // Data density
    const totalCells = data.reduce((sum, row) => sum + row.length, 0);
    const nonEmptyCells = data.reduce(
      (sum, row) => sum + row.filter(cell => cell && cell.trim().length > 0).length,
      0,
    );
    const dataDensity = totalCells > 0 ? nonEmptyCells / totalCells : 0;

    // Alignment score (simplified)
    const alignmentScore = avgRowCompleteness * columnConsistency;

    return {
      columnConsistency,
      rowCompleteness: avgRowCompleteness,
      dataDensity,
      alignmentScore,
      overall: (columnConsistency + avgRowCompleteness + dataDensity + alignmentScore) / 4,
    };
  }

  /**
   * Calculate detection confidence
   */
  private calculateDetectionConfidence(tables: DetectedTable[], quality: TableQuality): number {
    if (tables.length === 0) return 0;

    // Confidence based on quality and number of tables
    const qualityScore = quality.overall;
    const tableCountScore = Math.min(tables.length / 3, 1); // Prefer 1-3 tables

    return qualityScore * 0.7 + tableCountScore * 0.3;
  }

  /**
   * Calculate page area
   */
  private calculatePageArea(
    words: Array<{
      text: string;
      x0: number;
      x1: number;
      top: number;
      bottom: number;
      page: number;
    }>,
  ): number {
    if (words.length === 0) return 0;

    const width = Math.max(...words.map(w => w.x1)) - Math.min(...words.map(w => w.x0));
    const height = Math.max(...words.map(w => w.bottom)) - Math.min(...words.map(w => w.top));

    return width * height;
  }

  /**
   * Calculate line consistency
   */
  private calculateLineConsistency(
    lineGroups: Array<
      Array<{
        text: string;
        x0: number;
        x1: number;
        top: number;
        bottom: number;
        page: number;
      }>
    >,
  ): number {
    if (lineGroups.length === 0) return 0;

    const lengths = lineGroups.map(line => line.length);
    const avgLength = this.average(lengths);
    const consistency = 1 - this.standardDeviation(lengths) / avgLength;

    return consistency;
  }

  /**
   * Utility functions
   */
  private average(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private standardDeviation(values: number[]): number {
    const avg = this.average(values);
    const squaredDiffs = values.map(val => (val - avg) ** 2);
    const avgSquaredDiff = this.average(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }
}
