/**
 * Advanced alignment clustering for robust column detection
 * Uses Y-coordinate clustering and adaptive X-tolerance
 */

import { Injectable } from '@nestjs/common';
import { DetectedTable } from './adaptive-table-detector.util';

export interface ClusterResult {
  clusters: Cluster[];
  unclustered: Cell[];
  quality: AlignmentQuality;
}

export interface Cluster {
  id: number;
  y: number;
  cells: Cell[];
  xBoundaries: number[];
  confidence: number;
  avgColumnWidth: number;
}

export interface Cell {
  x: number;
  width: number;
  text: string;
  y: number;
}

export interface AlignmentQuality {
  consistencyScore: number; // 0-1
  toleranceScore: number; // 0-1
  gapScore: number; // 0-1
  overall: number; // 0-1
}

@Injectable()
export class AlignmentClusterService {
  /**
   * Perform Y-coordinate clustering to identify table rows
   */
  clusterByYCoordinates(cells: Cell[], tolerance = 2.0): Cluster[] {
    if (cells.length === 0) return [];

    // Sort cells by Y coordinate
    const sortedCells = [...cells].sort((a, b) => a.y - b.y);

    const clusters: Cluster[] = [];
    let currentCluster: Cluster | null = null;
    let clusterId = 0;

    for (const cell of sortedCells) {
      if (!currentCluster) {
        // Start new cluster
        currentCluster = {
          id: clusterId++,
          y: cell.y,
          cells: [cell],
          xBoundaries: [cell.x],
          confidence: 1.0,
          avgColumnWidth: cell.width,
        };
      } else {
        // Check if cell belongs to current cluster
        const yDistance = Math.abs(cell.y - currentCluster.y);

        if (yDistance <= tolerance) {
          // Add to current cluster
          currentCluster.cells.push(cell);

          // Update X boundaries
          const cellRight = cell.x + cell.width;
          if (!currentCluster.xBoundaries.includes(cellRight)) {
            currentCluster.xBoundaries.push(cellRight);
          }

          // Update average column width
          const totalWidth = currentCluster.cells.reduce((sum, c) => sum + c.width, 0);
          currentCluster.avgColumnWidth = totalWidth / currentCluster.cells.length;
        } else {
          // Start new cluster
          clusters.push(currentCluster);
          currentCluster = {
            id: clusterId++,
            y: cell.y,
            cells: [cell],
            xBoundaries: [cell.x],
            confidence: 1.0,
            avgColumnWidth: cell.width,
          };
        }
      }
    }

    // Add last cluster
    if (currentCluster) {
      clusters.push(currentCluster);
    }

    return this.calculateClusterConfidence(clusters);
  }

  /**
   * Calculate confidence scores for clusters
   */
  private calculateClusterConfidence(clusters: Cluster[]): Cluster[] {
    return clusters.map(cluster => {
      // Confidence based on cell count and consistency
      const cellCount = cluster.cells.length;
      let consistencyScore = 1.0;

      // Check X-coordinate consistency
      const xCoordinates = cluster.cells.map(c => c.x).sort((a, b) => a - b);
      let xGaps = 0;
      for (let i = 1; i < xCoordinates.length; i++) {
        const gap = xCoordinates[i] - xCoordinates[i - 1];
        if (gap > 0) xGaps++;
      }

      const avgGap = xGaps / (xCoordinates.length - 1);
      if (avgGap > 20) {
        // Large gaps indicate poor alignment
        consistencyScore -= 0.3;
      }

      // Width consistency
      const widths = cluster.cells.map(c => c.width);
      const avgWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;
      const widthVariance = widths.reduce((sum, w) => sum + (w - avgWidth) ** 2, 0) / widths.length;
      const widthStdDev = Math.sqrt(widthVariance);

      if (widthStdDev > avgWidth * 0.3) {
        consistencyScore -= 0.2;
      }

      return {
        ...cluster,
        confidence: Math.max(0, consistencyScore),
      };
    });
  }

  /**
   * Detect column boundaries using clustering and adaptive tolerance
   */
  detectColumnBoundaries(
    tables: DetectedTable[],
    options?: { baseTolerance?: number; adaptiveTolerance?: boolean; maxColumns?: number },
  ): Array<{ table: DetectedTable; alignments: Cluster[]; quality: AlignmentQuality }> {
    const baseTolerance = options?.baseTolerance ?? 2.0;
    const adaptiveTolerance = options?.adaptiveTolerance ?? true;
    const maxColumns = options?.maxColumns ?? 20;

    const results: Array<{
      table: DetectedTable;
      alignments: Cluster[];
      quality: AlignmentQuality;
    }> = [];

    for (const table of tables) {
      const cells = this.extractCellsFromTable(table);

      if (cells.length === 0) {
        results.push({
          table,
          alignments: [],
          quality: { consistencyScore: 0, toleranceScore: 0, gapScore: 0, overall: 0 },
        });
        continue;
      }

      // Adaptive tolerance based on data density
      let adaptiveToleranceValue = baseTolerance;
      if (adaptiveTolerance) {
        adaptiveToleranceValue = this.calculateAdaptiveTolerance(cells, baseTolerance);
      }

      // Perform clustering
      const clusters = this.clusterByYCoordinates(cells, adaptiveToleranceValue);

      // Limit number of columns
      const limitedClusters = clusters.slice(0, maxColumns);

      // Calculate quality metrics
      const quality = this.calculateAlignmentQuality(limitedClusters, adaptiveToleranceValue);

      results.push({
        table,
        alignments: limitedClusters,
        quality,
      });
    }

    return results;
  }

  /**
   * Extract individual cells from table data
   */
  private extractCellsFromTable(table: DetectedTable): Cell[] {
    const cells: Cell[] = [];

    if (table.structured && table.structured.length > 0) {
      // Extract from structured data
      for (const row of table.structured) {
        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i];
          cells.push({
            x: cell.x,
            width: this.estimateCellWidth(row, i),
            text: cell.text,
            y: row.y,
          });
        }
      }
    } else if (table.data && table.data.length > 0) {
      // Extract from simple data array
      const avgColumnCount =
        table.data.reduce((sum, row) => sum + row.length, 0) / table.data.length;

      for (let rowIdx = 0; rowIdx < table.data.length; rowIdx++) {
        const row = table.data[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          const x = colIdx * (1000 / avgColumnCount); // Estimate X position
          const width = 1000 / avgColumnCount; // Estimate width

          cells.push({
            x,
            width,
            text: row[colIdx] || '',
            y: rowIdx * 20, // Estimate Y position
          });
        }
      }
    }

    return cells;
  }

  /**
   * Estimate cell width from row data
   */
  private estimateCellWidth(row: any, columnIndex: number): number {
    if (row.cells?.[columnIndex + 1]) {
      const currentX = row.cells[columnIndex].x;
      const nextX = row.cells[columnIndex + 1].x;
      return nextX - currentX;
    }
    return 100; // Default width
  }

  /**
   * Calculate adaptive tolerance based on data characteristics
   */
  private calculateAdaptiveTolerance(cells: Cell[], baseTolerance: number): number {
    if (cells.length === 0) return baseTolerance;

    // Analyze Y-coordinate distribution
    const yCoordinates = cells.map(c => c.y).sort((a, b) => a - b);
    const yGaps: number[] = [];

    for (let i = 1; i < yCoordinates.length; i++) {
      const gap = yCoordinates[i] - yCoordinates[i - 1];
      if (gap > 0) {
        yGaps.push(gap);
      }
    }

    if (yGaps.length === 0) return baseTolerance;

    // Calculate statistics
    const avgGap = yGaps.reduce((sum, gap) => sum + gap, 0) / yGaps.length;
    const minGap = Math.min(...yGaps);
    const maxGap = Math.max(...yGaps);

    // Adaptive tolerance: tighter for consistent data, looser for sparse data
    if (avgGap < 10 && maxGap < 20) {
      return baseTolerance * 0.5; // Very consistent data
    }
    if (avgGap < 25 && maxGap < 50) {
      return baseTolerance * 0.8; // Moderately consistent
    }
    return baseTolerance * 1.5; // Sparse or inconsistent data
  }

  /**
   * Calculate alignment quality metrics
   */
  private calculateAlignmentQuality(clusters: Cluster[], tolerance: number): AlignmentQuality {
    if (clusters.length === 0) {
      return { consistencyScore: 0, toleranceScore: 0, gapScore: 0, overall: 0 };
    }

    // Consistency score based on cluster regularity
    const clusterSizes = clusters.map(c => c.cells.length);
    const avgClusterSize = clusterSizes.reduce((sum, size) => sum + size, 0) / clusterSizes.length;
    const sizeVariance =
      clusterSizes.reduce((sum, size) => sum + (size - avgClusterSize) ** 2, 0) /
      clusterSizes.length;
    const sizeStdDev = Math.sqrt(sizeVariance);
    const consistencyScore = Math.max(0, 1 - sizeStdDev / avgClusterSize);

    // Tolerance score based on gap analysis
    const gaps = this.analyzeGaps(clusters);
    const avgGap = gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0;
    const toleranceScore = Math.max(0, 1 - avgGap / tolerance);

    // Gap score (penalize large gaps)
    const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;
    const gapScore = Math.max(0, 1 - maxGap / (tolerance * 5));

    // Overall quality
    const overall = (consistencyScore + toleranceScore + gapScore) / 3;

    return {
      consistencyScore,
      toleranceScore,
      gapScore,
      overall,
    };
  }

  /**
   * Analyze gaps between clusters
   */
  private analyzeGaps(clusters: Cluster[]): number[] {
    const gaps: number[] = [];

    for (let i = 1; i < clusters.length; i++) {
      const gap = clusters[i].y - clusters[i - 1].y;
      if (gap > 0) {
        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Find best alignment among multiple candidates
   */
  findBestAlignment(
    alignmentCandidates: Array<{
      table: DetectedTable;
      alignments: Cluster[];
      quality: AlignmentQuality;
    }>,
  ): { table: DetectedTable; alignments: Cluster[]; quality: AlignmentQuality } | null {
    if (alignmentCandidates.length === 0) return null;

    // Sort by overall quality score
    const sorted = alignmentCandidates.sort((a, b) => b.quality.overall - a.quality.overall);

    return sorted[0] || null;
  }

  /**
   * Auto-fix alignment issues
   */
  autoFixAlignmentIssues(
    clusters: Cluster[],
    options?: { fillGaps?: boolean; splitColumns?: boolean; mergeSmallClusters?: boolean },
  ): Cluster[] {
    const fillGaps = options?.fillGaps ?? true;
    const splitColumns = options?.splitColumns ?? true;
    const mergeSmallClusters = options?.mergeSmallClusters ?? true;

    let fixedClusters = [...clusters];

    if (fillGaps) {
      fixedClusters = this.fillAlignmentGaps(fixedClusters);
    }

    if (splitColumns) {
      fixedClusters = this.splitOversizedColumns(fixedClusters);
    }

    if (mergeSmallClusters) {
      fixedClusters = this.mergeSmallAdjacentClusters(fixedClusters);
    }

    return fixedClusters;
  }

  /**
   * Fill gaps in alignment where appropriate
   */
  private fillAlignmentGaps(clusters: Cluster[]): Cluster[] {
    if (clusters.length < 2) return clusters;

    const fixedClusters: Cluster[] = [];

    for (let i = 0; i < clusters.length; i++) {
      const cluster = { ...clusters[i] };

      // Check for small gaps to next cluster
      if (i < clusters.length - 1) {
        const nextCluster = clusters[i + 1];
        const yGap = nextCluster.y - cluster.y;

        // If gap is small and cells are similar, merge
        if (
          yGap > 0 &&
          yGap < 5 &&
          Math.abs(cluster.cells.length - nextCluster.cells.length) <= 1
        ) {
          // Merge with next cluster
          nextCluster.cells.unshift(...cluster.cells);
          nextCluster.y = cluster.y; // Use earlier Y coordinate

          // Update merged cluster properties
          nextCluster.avgColumnWidth =
            nextCluster.cells.reduce((sum, c) => sum + c.width, 0) / nextCluster.cells.length;
          nextCluster.xBoundaries = [...cluster.xBoundaries, ...nextCluster.xBoundaries].sort(
            (a, b) => a - b,
          );

          continue; // Skip adding current cluster
        }
      }

      fixedClusters.push(cluster);
    }

    return fixedClusters;
  }

  /**
   * Split columns that are too wide
   */
  private splitOversizedColumns(clusters: Cluster[]): Cluster[] {
    return clusters.flatMap(cluster => {
      const maxCells = 15; // Maximum cells per cluster
      const avgWidth = cluster.avgColumnWidth;

      if (cluster.cells.length <= maxCells || avgWidth < 200) {
        return [cluster];
      }

      // Split cluster into smaller groups
      const splits: Cluster[] = [];
      for (let i = 0; i < cluster.cells.length; i += maxCells) {
        const splitCells = cluster.cells.slice(i, i + maxCells);

        splits.push({
          ...cluster,
          id: cluster.id * 1000 + splits.length, // Unique ID
          cells: splitCells,
          xBoundaries: splitCells.map(c => c.x),
          avgColumnWidth: splitCells.reduce((sum, c) => sum + c.width, 0) / splitCells.length,
          confidence: cluster.confidence * 0.8, // Reduced confidence for splits
        });
      }

      return splits;
    });
  }

  /**
   * Merge small adjacent clusters
   */
  private mergeSmallAdjacentClusters(clusters: Cluster[]): Cluster[] {
    const minCells = 2;

    return clusters.reduce((result: Cluster[], cluster, index) => {
      if (cluster.cells.length < minCells && index > 0) {
        const prevCluster = result[result.length - 1];

        // Check if clusters are close in Y coordinate
        const yDistance = Math.abs(cluster.y - prevCluster.y);

        if (yDistance < 3 && prevCluster.cells.length + cluster.cells.length <= 10) {
          // Merge with previous cluster
          prevCluster.cells.push(...cluster.cells);
          prevCluster.xBoundaries.push(...cluster.xBoundaries);
          prevCluster.avgColumnWidth =
            (prevCluster.cells.reduce((sum, c) => sum + c.width, 0) +
              cluster.cells.reduce((sum, c) => sum + c.width, 0)) /
            (prevCluster.cells.length + cluster.cells.length);

          return result; // Skip adding current cluster
        }
      }

      result.push(cluster);
      return result;
    }, []);
  }
}
