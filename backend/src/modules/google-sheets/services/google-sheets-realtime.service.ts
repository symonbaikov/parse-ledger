import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';

export interface GoogleSheetRowEventPayload {
  id: string;
  googleSheetId: string | null;
  spreadsheetId: string;
  sheetName: string;
  rowNumber: number;
  values: {
    colB: string | null;
    colC: string | null;
    colF: string | null;
  };
  editedAt: string | null;
  editedBy: string | null;
  editedColumn: number | null;
  editedCell: string | null;
  eventId?: string | null;
  updatedAt: string;
}

@Injectable()
export class GoogleSheetsRealtimeService {
  private readonly logger = new Logger(GoogleSheetsRealtimeService.name);
  private readonly streams = new Map<string, Set<Observer<MessageEvent>>>();

  subscribe(userId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      const observers = this.streams.get(userId) || new Set<Observer<MessageEvent>>();
      observers.add(observer);
      this.streams.set(userId, observers);

      observer.next({
        type: 'google-sheet-connection',
        data: { ok: true, connectedAt: new Date().toISOString() },
      });

      return () => {
        const nextObservers = this.streams.get(userId);
        nextObservers?.delete(observer);

        if (nextObservers && nextObservers.size === 0) {
          this.streams.delete(userId);
        }
      };
    });
  }

  broadcastUpdate(userId: string, payload: GoogleSheetRowEventPayload): void {
    const observers = this.streams.get(userId);
    if (!observers || observers.size === 0) {
      return;
    }

    observers.forEach((observer) => {
      observer.next({
        type: 'google-sheet-row-update',
        data: payload,
      });
    });

    this.logger.debug(
      `Broadcasted Google Sheets row update to user ${userId} (row ${payload.rowNumber})`,
    );
  }
}
