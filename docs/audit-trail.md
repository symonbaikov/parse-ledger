# Audit Trail

## Overview
The audit trail records all notable actions across workspaces in the `audit_events` table. Events are created through the backend `AuditService` and exposed via the `/audit-events` API. Use these records to track changes, diagnose issues, and (where supported) roll back operations.

## Event Structure
Each audit event contains:

- `id`: UUID
- `workspaceId`: nullable UUID, workspace scope
- `createdAt`: timestamp
- `actorType`: `user | system | integration`
- `actorId`: nullable UUID (user id when applicable)
- `actorLabel`: human-readable label (email, integration name, etc.)
- `entityType`: domain entity (transaction, statement, category, etc.)
- `entityId`: UUID of the entity
- `action`: `create | update | delete | import | link | unlink | match | unmatch | apply_rule | rollback | export`
- `diff`: `{ before, after }` snapshots or JSON patch array
- `meta`: optional metadata (reason, source, ruleId, provider, fileId, rowsCount, etc.)
- `batchId`: optional UUID used to group bulk operations
- `severity`: `info | warn | critical`
- `isUndoable`: indicates whether rollback is supported

## Diff Formats
`diff` supports two formats:

1. **Before/After snapshot**
   ```json
   {
     "before": { "amount": 100 },
     "after": { "amount": 150 }
   }
   ```
2. **Patch array**
   ```json
   [
     { "op": "replace", "path": "/amount", "value": 150 }
   ]
   ```

## Metadata (`meta`)
Use `meta` for context that does not belong in the diff:
- `reason`, `source`
- `confidence` (for ML/rules)
- `ruleId`, `ruleName`
- `provider` (Gmail, Google Sheets, Dropbox, etc.)
- `fileId`, `rowsCount`, `sheetId`, `spreadsheetId`
- `cell` (row/column/A1 for table cell edits)
- `rollbackOf` (for rollback events)

## Emitting Events
Use `AuditService` from service-layer code:

```ts
await this.auditService.createEvent({
  workspaceId,
  actorType: ActorType.USER,
  actorId: userId,
  entityType: EntityType.TRANSACTION,
  entityId: transaction.id,
  action: AuditAction.UPDATE,
  diff: { before, after },
  meta: { updatedFields: ['amount'] },
});
```

For batch operations, use `createBatchEvents` with a shared `batchId`.

## Rollback
Rollback is supported only when `isUndoable=true`. Current rollback coverage:
- Transactions (create/update/delete)
- Statements (create/update/delete)
- Categories (create/update/delete)
- Custom table rows (create/update/delete)

Rollback limitations:
- Only uses the stored `diff` snapshot (patch arrays are not reversible).
- Some side effects (external integrations, notifications) are not reversed.
- Permissions still apply; only authorized users can rollback.

## API Endpoints
All endpoints are protected by JWT auth, workspace context, and audit permissions.

- `GET /audit-events`
  - Filters: `entityType`, `entityId`, `actorType`, `actorId`,
    `dateFrom`, `dateTo`, `batchId`, `severity`, `page`, `limit`
- `GET /audit-events/:id`
- `GET /audit-events/entity/:entityType/:entityId`
- `GET /audit-events/batch/:batchId`
- `POST /audit-events/:id/rollback`

## Automatic Audit Capture (Decorated Handlers)
The global interceptor records events only for handlers annotated with `@Audit(...)`.

- Transactions: `PUT /transactions/:id`, `DELETE /transactions/:id`
- Statements: `POST /statements`, `POST /statements/upload`, `PATCH /statements/:id`, `DELETE /statements/:id`
- Categories: `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- Custom tables: `POST /custom-tables`, `POST /custom-tables/from-data-entry`,
  `POST /custom-tables/from-data-entry-custom-tab`, `POST /custom-tables/from-statements`,
  `PATCH /custom-tables/:id`, `DELETE /custom-tables/:id`

## Example Queries
Fetch all transaction events for a workspace:

```
GET /audit-events?entityType=transaction
```

Get all events for a specific entity:

```
GET /audit-events/entity/transaction/<transaction-id>
```
