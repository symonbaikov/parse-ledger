# FinFlow - Test Coverage Plan

**Version**: 1.0  
**Date**: January 14, 2026  
**Status**: Planning Document

---

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Module Coverage](#module-coverage)
  - [Auth Module](#auth-module)
  - [Users Module](#users-module)
  - [Statements Module](#statements-module)
  - [Parsing Module](#parsing-module)
  - [Transactions Module](#transactions-module)
  - [Categories Module](#categories-module)
  - [Classification Module](#classification-module)
  - [Wallets Module](#wallets-module)
  - [Branches Module](#branches-module)
  - [Workspaces Module](#workspaces-module)
  - [Custom Tables Module](#custom-tables-module)
  - [Data Entry Module](#data-entry-module)
  - [Google Sheets Module](#google-sheets-module)
  - [Telegram Module](#telegram-module)
  - [Reports Module](#reports-module)
  - [Storage Module](#storage-module)
- [Utility Functions](#utility-functions)
- [Coverage Goals](#coverage-goals)
- [Test Execution](#test-execution)

---

## Overview

This document outlines the comprehensive unit test coverage plan for the FinFlow backend system. The goal is to achieve **80%+ code coverage** with focus on critical business logic, security, and data integrity.

### Testing Principles

- **Isolation**: Each test should be independent and not rely on other tests
- **Clarity**: Test names should clearly describe what is being tested
- **Coverage**: Focus on business logic, edge cases, and error handling
- **Mocking**: External dependencies should be mocked (database, APIs, file system)
- **Speed**: Unit tests should be fast (<100ms per test)

---

## Testing Strategy

### Test Types

1. **Unit Tests** - Individual functions and methods (this document)
2. **Integration Tests** - Module interactions and database operations
3. **E2E Tests** - Complete API workflows

### Tools

- **Framework**: Jest
- **Mocking**: Jest mocks, jest.fn()
- **Database**: In-memory or test database with migrations
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior]', async () => {
      // Arrange - Setup test data and mocks
      // Act - Execute the method
      // Assert - Verify the results
    });

    it('should throw error when [error condition]', async () => {
      // Test error cases
    });
  });
});
```

---

## Module Coverage

## Auth Module

**Path**: `backend/src/modules/auth/`  
**Priority**: 🔴 Critical - Security sensitive

### Services to Test

#### `AuthService` (`auth.service.ts`)

##### `register(registerDto: RegisterDto)`
- ✅ Should create new user with hashed password
- ✅ Should throw ConflictException if email already exists
- ✅ Should validate email format
- ✅ Should validate password strength (min 6 chars)
- ✅ Should assign default role (user)
- ✅ Should create user in default workspace
- ✅ Should not store plain text password

##### `login(loginDto: LoginDto)`
- ✅ Should return access and refresh tokens for valid credentials
- ✅ Should throw UnauthorizedException for invalid email
- ✅ Should throw UnauthorizedException for invalid password
- ✅ Should hash refresh token before storing
- ✅ Should update user's refresh token in database
- ✅ Should apply rate limiting (throttle guard)
- ✅ Should handle case-insensitive email lookup

##### `refresh(userId: number, refreshToken: string)`
- ✅ Should return new access token for valid refresh token
- ✅ Should throw UnauthorizedException if user not found
- ✅ Should throw UnauthorizedException if refresh token doesn't match
- ✅ Should throw UnauthorizedException if refresh token expired
- ✅ Should verify token signature
- ✅ Should update last login timestamp

##### `logout(userId: number)`
- ✅ Should clear refresh token from database
- ✅ Should return success even if user not found
- ✅ Should handle database errors gracefully

##### `validateUser(email: string, password: string)`
- ✅ Should return user for valid credentials
- ✅ Should return null for invalid email
- ✅ Should return null for invalid password
- ✅ Should use bcrypt.compare for password verification
- ✅ Should not expose user password in response

##### `hashPassword(password: string)`
- ✅ Should return bcrypt hash with salt
- ✅ Should generate different hashes for same password
- ✅ Should use configured salt rounds

### Guards to Test

#### `JwtAuthGuard` (`guards/jwt-auth.guard.ts`)
- ✅ Should allow access with valid JWT token
- ✅ Should deny access without token
- ✅ Should deny access with expired token
- ✅ Should deny access with invalid signature
- ✅ Should bypass guard for @Public() decorated routes
- ✅ Should extract user from token and add to request

#### `JwtRefreshGuard` (`guards/jwt-refresh.guard.ts`)
- ✅ Should validate refresh token
- ✅ Should deny access with access token (not refresh)
- ✅ Should extract user from refresh token

#### `ThrottleLoginGuard` (`guards/throttle-login.guard.ts`)
- ✅ Should allow requests under limit (100/hour)
- ✅ Should block requests over limit
- ✅ Should reset counter after time window
- ✅ Should track by IP address

### Strategies to Test

#### `JwtStrategy` (`strategies/jwt.strategy.ts`)
- ✅ Should validate access token
- ✅ Should extract payload from token
- ✅ Should return user object
- ✅ Should throw error for invalid token

#### `JwtRefreshStrategy` (`strategies/jwt-refresh.strategy.ts`)
- ✅ Should validate refresh token
- ✅ Should extract userId from payload
- ✅ Should verify token expiration

### Test Files to Create
```
auth/
├── auth.service.spec.ts
├── guards/
│   ├── jwt-auth.guard.spec.ts
│   ├── jwt-refresh.guard.spec.ts
│   └── throttle-login.guard.spec.ts
└── strategies/
    ├── jwt.strategy.spec.ts
    └── jwt-refresh.strategy.spec.ts
```

---

## Users Module

**Path**: `backend/src/modules/users/`  
**Priority**: 🔴 Critical - User management

### Services to Test

#### `UsersService` (`users.service.ts`)

##### `create(createUserDto: CreateUserDto)`
- ✅ Should create user with workspace association
- ✅ Should hash password before saving
- ✅ Should throw ConflictException if email exists
- ✅ Should validate email format
- ✅ Should set default role
- ✅ Should generate unique username if not provided

##### `findAll(workspaceId: number)`
- ✅ Should return all users in workspace
- ✅ Should not include deleted users
- ✅ Should include user roles
- ✅ Should handle empty result
- ✅ Should filter by workspace access

##### `findOne(id: number)`
- ✅ Should return user by id
- ✅ Should include workspace memberships
- ✅ Should include roles and permissions
- ✅ Should throw NotFoundException if not found
- ✅ Should not expose password field

##### `findByEmail(email: string)`
- ✅ Should return user by email
- ✅ Should be case-insensitive
- ✅ Should return null if not found
- ✅ Should include password field (for auth)

##### `update(id: number, updateUserDto: UpdateUserDto)`
- ✅ Should update user fields
- ✅ Should not update email if already taken
- ✅ Should rehash password if changed
- ✅ Should not allow updating other user's data
- ✅ Should update workspace roles if provided
- ✅ Should throw NotFoundException if user doesn't exist

##### `remove(id: number)`
- ✅ Should soft delete user
- ✅ Should mark user as deleted
- ✅ Should revoke all tokens
- ✅ Should remove from workspace memberships
- ✅ Should not physically delete from database

##### `changePassword(userId: number, oldPassword: string, newPassword: string)`
- ✅ Should verify old password
- ✅ Should hash new password
- ✅ Should revoke all refresh tokens
- ✅ Should throw UnauthorizedException if old password wrong
- ✅ Should validate new password strength

#### `PermissionsService` (`services/permissions.service.ts`)

##### `checkPermission(userId: number, workspaceId: number, permission: Permission)`
- ✅ Should return true for workspace owner
- ✅ Should return true if user has permission
- ✅ Should return false if permission denied
- ✅ Should check role-based permissions
- ✅ Should check user-specific permissions
- ✅ Should handle non-existent user
- ✅ Should cache permission results

##### `grantPermission(userId: number, workspaceId: number, permission: Permission)`
- ✅ Should add permission to user
- ✅ Should not duplicate existing permissions
- ✅ Should require admin role
- ✅ Should invalidate permission cache

##### `revokePermission(userId: number, workspaceId: number, permission: Permission)`
- ✅ Should remove permission from user
- ✅ Should handle non-existent permission
- ✅ Should require admin role
- ✅ Should invalidate permission cache

### Test Files to Create
```
users/
├── users.service.spec.ts
└── services/
    └── permissions.service.spec.ts
```

---

## Statements Module

**Path**: `backend/src/modules/statements/`  
**Priority**: 🔴 Critical - Core functionality

### Services to Test

#### `StatementsService` (`statements.service.ts`)

##### `create(createStatementDto: CreateStatementDto, file: Express.Multer.File, userId: number)`
- ✅ Should create statement record with uploaded file
- ✅ Should calculate file hash (SHA-256)
- ✅ Should reject duplicate file by hash
- ✅ Should validate file type (PDF, CSV, XLS)
- ✅ Should validate file size (max 10MB)
- ✅ Should set initial status to 'pending'
- ✅ Should associate with user and workspace
- ✅ Should trigger parsing job
- ✅ Should handle idempotency key
- ✅ Should store file in configured directory

##### `findAll(workspaceId: number, filters: StatementFilters)`
- ✅ Should return statements for workspace
- ✅ Should filter by status
- ✅ Should filter by date range
- ✅ Should filter by uploaded_by user
- ✅ Should sort by upload date (desc)
- ✅ Should paginate results
- ✅ Should include transaction count

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return statement with transactions
- ✅ Should check workspace access
- ✅ Should throw NotFoundException if not found
- ✅ Should include user who uploaded
- ✅ Should include parsing errors if any

##### `update(id: number, updateStatementDto: UpdateStatementDto, workspaceId: number)`
- ✅ Should update statement metadata
- ✅ Should not allow changing file
- ✅ Should validate workspace access
- ✅ Should update status
- ✅ Should log status changes

##### `remove(id: number, workspaceId: number)`
- ✅ Should soft delete statement
- ✅ Should mark associated transactions as deleted
- ✅ Should not delete file from storage
- ✅ Should require workspace admin permission
- ✅ Should throw NotFoundException if not exists

##### `reparse(id: number, workspaceId: number)`
- ✅ Should trigger new parsing job
- ✅ Should reset status to 'pending'
- ✅ Should clear previous errors
- ✅ Should validate workspace access
- ✅ Should handle already processing status

##### `checkDuplicate(fileHash: string, workspaceId: number)`
- ✅ Should return true if hash exists
- ✅ Should return false if hash unique
- ✅ Should scope check to workspace
- ✅ Should ignore deleted statements

### Test Files to Create
```
statements/
└── statements.service.spec.ts
```

---

## Parsing Module

**Path**: `backend/src/modules/parsing/`  
**Priority**: 🔴 Critical - Core business logic

### Services to Test

#### `StatementProcessingService` (`services/statement-processing.service.ts`)

##### `processStatement(statementId: number)`
- ✅ Should parse PDF statement successfully
- ✅ Should parse CSV statement successfully
- ✅ Should extract transactions from statement
- ✅ Should classify transactions automatically
- ✅ Should detect bank format (Sberbank, Tinkoff, etc.)
- ✅ Should handle multi-page PDFs
- ✅ Should validate transaction data
- ✅ Should update statement status to 'processed'
- ✅ Should set status to 'failed' on error
- ✅ Should store parsing errors
- ✅ Should handle corrupted files
- ✅ Should respect concurrency limits

##### `extractTransactions(fileContent: Buffer, format: BankFormat)`
- ✅ Should extract all transactions from content
- ✅ Should parse dates correctly
- ✅ Should parse amounts with correct signs
- ✅ Should extract description/purpose
- ✅ Should handle multiple currencies
- ✅ Should validate transaction structure
- ✅ Should skip header/footer rows

##### `detectBankFormat(fileContent: Buffer)`
- ✅ Should detect Sberbank format
- ✅ Should detect Tinkoff format
- ✅ Should detect Alfa-Bank format
- ✅ Should return 'unknown' for unsupported format
- ✅ Should check format signatures
- ✅ Should handle incomplete files

##### `validateTransaction(transaction: ParsedTransaction)`
- ✅ Should validate required fields
- ✅ Should validate date format
- ✅ Should validate amount is number
- ✅ Should validate currency code
- ✅ Should reject invalid transactions
- ✅ Should provide clear error messages

#### `ParserFactoryService` (`services/parser-factory.service.ts`)

##### `getParser(format: BankFormat)`
- ✅ Should return correct parser for Sberbank
- ✅ Should return correct parser for Tinkoff
- ✅ Should return correct parser for Alfa-Bank
- ✅ Should throw error for unsupported format
- ✅ Should cache parser instances
- ✅ Should handle CSV parser
- ✅ Should handle PDF parser

#### `ParsingRulesService` (`services/parsing-rules.service.ts`)

##### `applyRules(transaction: ParsedTransaction)`
- ✅ Should apply all matching rules
- ✅ Should classify by description pattern
- ✅ Should assign category
- ✅ Should normalize description
- ✅ Should execute rules in priority order
- ✅ Should handle rule conflicts
- ✅ Should log rule applications

##### `createRule(ruleDto: CreateRuleDto, workspaceId: number)`
- ✅ Should create new parsing rule
- ✅ Should validate regex pattern
- ✅ Should set default priority
- ✅ Should associate with workspace
- ✅ Should validate category exists

##### `testRule(ruleDto: RuleDto, testData: string)`
- ✅ Should test regex against test data
- ✅ Should return match result
- ✅ Should show captured groups
- ✅ Should handle invalid regex

### Test Files to Create
```
parsing/
└── services/
    ├── statement-processing.service.spec.ts
    ├── parser-factory.service.spec.ts
    └── parsing-rules.service.spec.ts
```

---

## Transactions Module

**Path**: `backend/src/modules/transactions/`  
**Priority**: 🟡 High - Data management

### Services to Test

#### `TransactionsService` (`transactions.service.ts`)

##### `create(createTransactionDto: CreateTransactionDto, workspaceId: number)`
- ✅ Should create transaction
- ✅ Should validate amount is number
- ✅ Should validate date format
- ✅ Should associate with statement if provided
- ✅ Should set workspace
- ✅ Should apply classification rules
- ✅ Should handle negative amounts

##### `findAll(workspaceId: number, filters: TransactionFilters)`
- ✅ Should return all workspace transactions
- ✅ Should filter by date range
- ✅ Should filter by category
- ✅ Should filter by amount range
- ✅ Should filter by wallet
- ✅ Should search by description
- ✅ Should sort by date (desc default)
- ✅ Should paginate results
- ✅ Should calculate totals

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return transaction with relations
- ✅ Should include category
- ✅ Should include wallet
- ✅ Should include statement
- ✅ Should throw NotFoundException if not found
- ✅ Should validate workspace access

##### `update(id: number, updateTransactionDto: UpdateTransactionDto, workspaceId: number)`
- ✅ Should update transaction fields
- ✅ Should validate workspace access
- ✅ Should update category
- ✅ Should update wallet
- ✅ Should recalculate wallet balance
- ✅ Should log changes

##### `remove(id: number, workspaceId: number)`
- ✅ Should soft delete transaction
- ✅ Should update wallet balance
- ✅ Should validate workspace access
- ✅ Should not allow deleting statement transactions

##### `bulkUpdate(ids: number[], updates: Partial<Transaction>, workspaceId: number)`
- ✅ Should update multiple transactions
- ✅ Should validate all IDs belong to workspace
- ✅ Should apply same updates to all
- ✅ Should handle partial failures
- ✅ Should return update count

##### `categorize(id: number, categoryId: number, workspaceId: number)`
- ✅ Should assign category to transaction
- ✅ Should validate category exists
- ✅ Should validate workspace access
- ✅ Should update classification confidence

##### `getStatistics(workspaceId: number, dateRange: DateRange)`
- ✅ Should calculate total income
- ✅ Should calculate total expenses
- ✅ Should calculate net balance
- ✅ Should group by category
- ✅ Should group by time period
- ✅ Should filter by date range

### Test Files to Create
```
transactions/
└── transactions.service.spec.ts
```

---

## Categories Module

**Path**: `backend/src/modules/categories/`  
**Priority**: 🟡 High - Classification

### Services to Test

#### `CategoriesService` (`categories.service.ts`)

##### `create(createCategoryDto: CreateCategoryDto, workspaceId: number)`
- ✅ Should create category
- ✅ Should validate unique name in workspace
- ✅ Should set parent category if provided
- ✅ Should validate parent exists
- ✅ Should prevent circular references
- ✅ Should assign default icon/color

##### `findAll(workspaceId: number)`
- ✅ Should return all workspace categories
- ✅ Should return hierarchical structure
- ✅ Should include transaction count
- ✅ Should include subcategories
- ✅ Should order by name

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return category with details
- ✅ Should include parent category
- ✅ Should include child categories
- ✅ Should include transaction count
- ✅ Should throw NotFoundException if not found

##### `update(id: number, updateCategoryDto: UpdateCategoryDto, workspaceId: number)`
- ✅ Should update category fields
- ✅ Should validate unique name
- ✅ Should update parent category
- ✅ Should prevent circular references
- ✅ Should update icon/color

##### `remove(id: number, workspaceId: number)`
- ✅ Should delete category
- ✅ Should move subcategories to parent
- ✅ Should reassign transactions to parent
- ✅ Should throw error if has transactions (optional)
- ✅ Should handle root category deletion

##### `getTree(workspaceId: number)`
- ✅ Should return category tree structure
- ✅ Should nest subcategories
- ✅ Should include transaction counts
- ✅ Should order by hierarchy

### Test Files to Create
```
categories/
└── categories.service.spec.ts
```

---

## Classification Module

**Path**: `backend/src/modules/classification/`  
**Priority**: 🟡 High - ML/Rules engine

### Services to Test

#### `ClassificationService` (`classification.service.ts`)

##### `classifyTransaction(transaction: Transaction)`
- ✅ Should assign category based on rules
- ✅ Should calculate confidence score
- ✅ Should use regex matching
- ✅ Should use keyword matching
- ✅ Should prioritize manual classifications
- ✅ Should handle unknown patterns
- ✅ Should learn from manual corrections

##### `suggestCategories(description: string, amount: number)`
- ✅ Should return top 3 suggestions
- ✅ Should include confidence scores
- ✅ Should consider amount range
- ✅ Should consider description patterns
- ✅ Should order by confidence

##### `trainModel(workspaceId: number)`
- ✅ Should analyze historical transactions
- ✅ Should extract patterns
- ✅ Should update classification rules
- ✅ Should improve accuracy
- ✅ Should handle insufficient data

##### `getAccuracy(workspaceId: number)`
- ✅ Should calculate classification accuracy
- ✅ Should compare auto vs manual
- ✅ Should return percentage
- ✅ Should handle no manual classifications

### Test Files to Create
```
classification/
└── classification.service.spec.ts
```

---

## Wallets Module

**Path**: `backend/src/modules/wallets/`  
**Priority**: 🟡 High - Balance tracking

### Services to Test

#### `WalletsService` (`wallets.service.ts`)

##### `create(createWalletDto: CreateWalletDto, workspaceId: number)`
- ✅ Should create wallet
- ✅ Should set initial balance
- ✅ Should validate currency
- ✅ Should set default wallet type
- ✅ Should associate with workspace

##### `findAll(workspaceId: number)`
- ✅ Should return all workspace wallets
- ✅ Should include current balance
- ✅ Should include transaction count
- ✅ Should order by name

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return wallet details
- ✅ Should include balance history
- ✅ Should include recent transactions
- ✅ Should throw NotFoundException if not found

##### `update(id: number, updateWalletDto: UpdateWalletDto, workspaceId: number)`
- ✅ Should update wallet fields
- ✅ Should not allow changing balance directly
- ✅ Should update name, currency, type
- ✅ Should validate workspace access

##### `remove(id: number, workspaceId: number)`
- ✅ Should delete wallet
- ✅ Should require zero balance (or force flag)
- ✅ Should handle transactions reassignment
- ✅ Should validate workspace access

##### `getBalance(id: number, workspaceId: number)`
- ✅ Should calculate current balance
- ✅ Should sum all transactions
- ✅ Should handle multiple currencies
- ✅ Should return balance with currency

##### `updateBalance(id: number, transactionAmount: number)`
- ✅ Should add amount to balance
- ✅ Should subtract amount from balance
- ✅ Should handle negative balances
- ✅ Should update balance_updated_at
- ✅ Should lock wallet during update

### Test Files to Create
```
wallets/
└── wallets.service.spec.ts
```

---

## Branches Module

**Path**: `backend/src/modules/branches/`  
**Priority**: 🟢 Medium - Organization

### Services to Test

#### `BranchesService` (`branches.service.ts`)

##### `create(createBranchDto: CreateBranchDto, workspaceId: number)`
- ✅ Should create branch
- ✅ Should validate unique name in workspace
- ✅ Should associate with workspace
- ✅ Should set default properties

##### `findAll(workspaceId: number)`
- ✅ Should return all workspace branches
- ✅ Should order by name
- ✅ Should include transaction count

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return branch details
- ✅ Should throw NotFoundException if not found
- ✅ Should validate workspace access

##### `update(id: number, updateBranchDto: UpdateBranchDto, workspaceId: number)`
- ✅ Should update branch fields
- ✅ Should validate unique name
- ✅ Should validate workspace access

##### `remove(id: number, workspaceId: number)`
- ✅ Should delete branch
- ✅ Should reassign transactions to null
- ✅ Should validate workspace access

### Test Files to Create
```
branches/
└── branches.service.spec.ts
```

---

## Workspaces Module

**Path**: `backend/src/modules/workspaces/`  
**Priority**: 🔴 Critical - Multi-tenancy

### Services to Test

#### `WorkspacesService` (`workspaces.service.ts`)

##### `create(createWorkspaceDto: CreateWorkspaceDto, ownerId: number)`
- ✅ Should create workspace
- ✅ Should set creator as owner
- ✅ Should create default categories
- ✅ Should create default wallet
- ✅ Should generate unique slug
- ✅ Should set default settings

##### `findAll(userId: number)`
- ✅ Should return user's workspaces
- ✅ Should include user role in each
- ✅ Should include member count
- ✅ Should order by name

##### `findOne(id: number, userId: number)`
- ✅ Should return workspace details
- ✅ Should validate user has access
- ✅ Should include members
- ✅ Should include statistics
- ✅ Should throw ForbiddenException if no access

##### `update(id: number, updateWorkspaceDto: UpdateWorkspaceDto, userId: number)`
- ✅ Should update workspace fields
- ✅ Should require owner or admin role
- ✅ Should validate unique name
- ✅ Should update settings

##### `remove(id: number, userId: number)`
- ✅ Should delete workspace
- ✅ Should require owner role
- ✅ Should delete all associated data
- ✅ Should handle cascading deletes
- ✅ Should prevent deleting last workspace

##### `inviteMember(workspaceId: number, email: string, role: WorkspaceRole, inviterId: number)`
- ✅ Should send invitation email
- ✅ Should create invite record
- ✅ Should validate email format
- ✅ Should require admin role
- ✅ Should handle existing member
- ✅ Should set invite expiration

##### `acceptInvite(token: string, userId: number)`
- ✅ Should add user to workspace
- ✅ Should assign specified role
- ✅ Should mark invite as accepted
- ✅ Should throw error if expired
- ✅ Should throw error if already used

##### `removeMember(workspaceId: number, userId: number, removerId: number)`
- ✅ Should remove user from workspace
- ✅ Should require admin role
- ✅ Should not allow removing owner
- ✅ Should not allow self-removal for owner
- ✅ Should revoke permissions

##### `changeRole(workspaceId: number, userId: number, newRole: WorkspaceRole, changerId: number)`
- ✅ Should update user role
- ✅ Should require admin role
- ✅ Should validate new role
- ✅ Should not allow changing owner role
- ✅ Should update permissions

### Test Files to Create
```
workspaces/
└── workspaces.service.spec.ts
```

---

## Custom Tables Module

**Path**: `backend/src/modules/custom-tables/`  
**Priority**: 🟡 High - Flexible data

### Services to Test

#### `CustomTablesService` (`custom-tables.service.ts`)

##### `create(createTableDto: CreateTableDto, workspaceId: number)`
- ✅ Should create custom table
- ✅ Should validate column definitions
- ✅ Should set default column types
- ✅ Should create table schema
- ✅ Should validate unique table name

##### `findAll(workspaceId: number)`
- ✅ Should return all workspace tables
- ✅ Should include row count
- ✅ Should include column definitions
- ✅ Should order by name

##### `findOne(id: number, workspaceId: number)`
- ✅ Should return table details
- ✅ Should include all rows
- ✅ Should include column metadata
- ✅ Should throw NotFoundException if not found

##### `update(id: number, updateTableDto: UpdateTableDto, workspaceId: number)`
- ✅ Should update table metadata
- ✅ Should allow adding columns
- ✅ Should not allow removing columns with data
- ✅ Should validate column types
- ✅ Should update schema

##### `remove(id: number, workspaceId: number)`
- ✅ Should delete table
- ✅ Should delete all rows
- ✅ Should require confirmation if has data
- ✅ Should validate workspace access

##### `addRow(tableId: number, rowData: any, workspaceId: number)`
- ✅ Should insert new row
- ✅ Should validate against schema
- ✅ Should validate required fields
- ✅ Should validate data types
- ✅ Should set default values

##### `updateRow(tableId: number, rowId: number, rowData: any, workspaceId: number)`
- ✅ Should update row data
- ✅ Should validate against schema
- ✅ Should partial update fields
- ✅ Should preserve other fields

##### `deleteRow(tableId: number, rowId: number, workspaceId: number)`
- ✅ Should delete row
- ✅ Should validate exists
- ✅ Should validate workspace access

### Test Files to Create
```
custom-tables/
├── custom-tables.service.spec.ts
└── custom-table-import-jobs.service.spec.ts
```

---

## Data Entry Module

**Path**: `backend/src/modules/data-entry/`  
**Priority**: 🟢 Medium - Manual input

### Services to Test

#### `DataEntryService` (`data-entry.service.ts`)

##### `createEntry(createEntryDto: CreateEntryDto, workspaceId: number)`
- ✅ Should create data entry
- ✅ Should validate table exists
- ✅ Should validate column exists
- ✅ Should validate data type
- ✅ Should associate with user

##### `findAll(tableId: number, workspaceId: number)`
- ✅ Should return all entries for table
- ✅ Should order by created date
- ✅ Should include user who created
- ✅ Should validate workspace access

##### `update(id: number, updateEntryDto: UpdateEntryDto, workspaceId: number)`
- ✅ Should update entry data
- ✅ Should validate against schema
- ✅ Should log update history
- ✅ Should validate workspace access

##### `remove(id: number, workspaceId: number)`
- ✅ Should delete entry
- ✅ Should soft delete or hard delete
- ✅ Should validate workspace access

### Test Files to Create
```
data-entry/
└── data-entry.service.spec.ts
```

---

## Google Sheets Module

**Path**: `backend/src/modules/google-sheets/`  
**Priority**: 🟡 High - External integration

### Services to Test

#### `GoogleSheetsService` (`google-sheets.service.ts`)

##### `authorize(userId: number, code: string)`
- ✅ Should exchange code for tokens
- ✅ Should store refresh token
- ✅ Should validate authorization code
- ✅ Should handle OAuth errors

##### `getSpreadsheets(userId: number)`
- ✅ Should list user's spreadsheets
- ✅ Should use cached tokens
- ✅ Should refresh expired tokens
- ✅ Should handle API errors

##### `exportToSheet(workspaceId: number, tableId: number, spreadsheetId: string)`
- ✅ Should export table to sheet
- ✅ Should format headers
- ✅ Should format data rows
- ✅ Should handle large datasets
- ✅ Should update existing sheet
- ✅ Should validate permissions

##### `importFromSheet(workspaceId: number, spreadsheetId: string, sheetName: string)`
- ✅ Should import sheet data
- ✅ Should parse headers
- ✅ Should validate data types
- ✅ Should create table if not exists
- ✅ Should handle errors gracefully

##### `syncWithSheet(workspaceId: number, tableId: number, spreadsheetId: string)`
- ✅ Should bidirectional sync
- ✅ Should detect changes
- ✅ Should resolve conflicts
- ✅ Should handle concurrent updates
- ✅ Should preserve data integrity

#### `GoogleSheetsApiService` (`services/google-sheets-api.service.ts`)

##### `readSheet(spreadsheetId: string, range: string, accessToken: string)`
- ✅ Should read sheet data
- ✅ Should handle A1 notation
- ✅ Should handle named ranges
- ✅ Should retry on rate limits
- ✅ Should handle API errors

##### `writeSheet(spreadsheetId: string, range: string, values: any[][], accessToken: string)`
- ✅ Should write data to sheet
- ✅ Should batch updates
- ✅ Should handle large writes
- ✅ Should preserve formatting
- ✅ Should handle quota limits

##### `createSheet(spreadsheetId: string, sheetName: string, accessToken: string)`
- ✅ Should create new sheet tab
- ✅ Should validate sheet name
- ✅ Should handle existing sheets
- ✅ Should set default properties

### Test Files to Create
```
google-sheets/
├── google-sheets.service.spec.ts
└── services/
    ├── google-sheets-api.service.spec.ts
    ├── google-sheets-updates.service.spec.ts
    ├── google-sheets-realtime.service.spec.ts
    └── google-sheets-analytics.service.spec.ts
```

---

## Telegram Module

**Path**: `backend/src/modules/telegram/`  
**Priority**: 🟢 Medium - Notifications

### Services to Test

#### `TelegramService` (`telegram.service.ts`)

##### `sendMessage(chatId: string, message: string)`
- ✅ Should send text message
- ✅ Should handle long messages (split)
- ✅ Should retry on failure
- ✅ Should validate chat ID
- ✅ Should handle rate limits

##### `sendReport(userId: number, reportType: string, data: any)`
- ✅ Should format report message
- ✅ Should include data visualization
- ✅ Should handle different report types
- ✅ Should send to user's chat
- ✅ Should validate user has Telegram linked

##### `linkAccount(userId: number, telegramUsername: string)`
- ✅ Should link Telegram account
- ✅ Should validate username
- ✅ Should send confirmation message
- ✅ Should handle already linked accounts

##### `unlinkAccount(userId: number)`
- ✅ Should unlink Telegram account
- ✅ Should stop sending notifications
- ✅ Should send goodbye message

### Test Files to Create
```
telegram/
└── telegram.service.spec.ts
```

---

## Reports Module

**Path**: `backend/src/modules/reports/`  
**Priority**: 🟡 High - Analytics

### Services to Test

#### `ReportsService` (`reports.service.ts`)

##### `generateMonthlyReport(workspaceId: number, month: Date)`
- ✅ Should calculate monthly totals
- ✅ Should group by categories
- ✅ Should include income/expenses
- ✅ Should calculate trends
- ✅ Should format for export

##### `generateCategoryReport(workspaceId: number, categoryId: number, dateRange: DateRange)`
- ✅ Should aggregate category transactions
- ✅ Should calculate totals
- ✅ Should include subcategories
- ✅ Should show trends over time

##### `generateCustomReport(workspaceId: number, config: ReportConfig)`
- ✅ Should apply custom filters
- ✅ Should aggregate by specified fields
- ✅ Should support custom calculations
- ✅ Should export in multiple formats

##### `exportReport(reportId: number, format: ExportFormat)`
- ✅ Should export as PDF
- ✅ Should export as Excel
- ✅ Should export as CSV
- ✅ Should include charts
- ✅ Should format data properly

### Test Files to Create
```
reports/
└── reports.service.spec.ts
```

---

## Storage Module

**Path**: `backend/src/modules/storage/`  
**Priority**: 🟢 Medium - File management

### Services to Test

#### `StorageService` (`storage.service.ts`)

##### `uploadFile(file: Express.Multer.File, userId: number)`
- ✅ Should save file to disk
- ✅ Should generate unique filename
- ✅ Should calculate file hash
- ✅ Should validate file type
- ✅ Should validate file size
- ✅ Should create database record

##### `getFile(fileId: number, userId: number)`
- ✅ Should retrieve file metadata
- ✅ Should validate access permissions
- ✅ Should return file path
- ✅ Should throw NotFoundException if not exists

##### `downloadFile(fileId: number, userId: number)`
- ✅ Should stream file content
- ✅ Should validate access permissions
- ✅ Should set correct headers
- ✅ Should handle large files

##### `deleteFile(fileId: number, userId: number)`
- ✅ Should remove file from disk
- ✅ Should delete database record
- ✅ Should validate access permissions
- ✅ Should handle file not found

##### `getFileUrl(fileId: number)`
- ✅ Should generate signed URL
- ✅ Should set expiration
- ✅ Should validate file exists
- ✅ Should handle CDN URLs

### Test Files to Create
```
storage/
└── storage.service.spec.ts
```

---

## Utility Functions

**Path**: `backend/src/common/utils/`  
**Priority**: 🟡 High - Shared logic

### Utils to Test

#### `file-hash.util.ts`

##### `calculateFileHash(file: Buffer)`
- ✅ Should calculate SHA-256 hash
- ✅ Should return hex string
- ✅ Should be deterministic
- ✅ Should handle large files
- ✅ Should handle empty files

#### `pdf-parser.util.ts`

##### `parsePdfToText(buffer: Buffer)`
- ✅ Should extract text from PDF
- ✅ Should preserve line breaks
- ✅ Should handle multi-page PDFs
- ✅ Should handle encrypted PDFs
- ✅ Should throw error for corrupted files

##### `extractTables(pdfText: string)`
- ✅ Should detect table structure
- ✅ Should parse rows and columns
- ✅ Should handle merged cells
- ✅ Should handle empty cells

#### `filename.util.ts`

##### `normalizeFilename(filename: string)`
- ✅ Should remove special characters
- ✅ Should convert to lowercase
- ✅ Should replace spaces with hyphens
- ✅ Should preserve extension
- ✅ Should handle non-ASCII characters

##### `generateUniqueFilename(originalName: string)`
- ✅ Should append timestamp
- ✅ Should append random string
- ✅ Should preserve extension
- ✅ Should ensure uniqueness

#### `async.util.ts`

##### `retryWithBackoff(fn: Function, maxRetries: number)`
- ✅ Should retry on failure
- ✅ Should use exponential backoff
- ✅ Should stop after max retries
- ✅ Should return result on success
- ✅ Should throw on final failure

##### `sleep(ms: number)`
- ✅ Should delay execution
- ✅ Should resolve after specified time
- ✅ Should handle zero delay

#### `semaphore.util.ts`

##### `acquire()`
- ✅ Should allow up to limit concurrent operations
- ✅ Should queue excess operations
- ✅ Should release on completion
- ✅ Should handle errors

##### `release()`
- ✅ Should decrement counter
- ✅ Should process queue
- ✅ Should handle multiple releases

### Test Files to Create
```
common/utils/
├── file-hash.util.spec.ts
├── pdf-parser.util.spec.ts
├── filename.util.spec.ts
├── async.util.spec.ts
└── semaphore.util.spec.ts
```

---

## Coverage Goals

### Overall Target: 80%+

- **Critical Modules** (Auth, Users, Workspaces): 90%+
- **Core Business Logic** (Statements, Parsing, Transactions): 85%+
- **Secondary Features** (Reports, Sheets, Telegram): 75%+
- **Utilities**: 90%+

### Metrics to Track

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of branches (if/else) tested
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

### Priority Levels

- 🔴 **Critical**: Security, authentication, data integrity
- 🟡 **High**: Core business logic, user-facing features
- 🟢 **Medium**: Supporting features, integrations
- ⚪ **Low**: Non-critical utilities, convenience functions

---

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific module
npm test -- statements

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run only changed files
npm test -- --onlyChanged
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:cov

# View HTML coverage report
open coverage/lcov-report/index.html
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test -- --coverage --ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Test Database

```bash
# Use test database
export NODE_ENV=test
export DATABASE_URL=postgresql://finflow:finflow@localhost:5432/finflow_test

# Run migrations
npm run migration:run

# Seed test data
npm run seed:test
```

---

## Test Naming Convention

### Describe Blocks
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior]', () => {});
  });
});
```

### Test Cases
```typescript
// Good
it('should create user with hashed password')
it('should throw ConflictException when email exists')
it('should return transactions filtered by date range')

// Bad
it('test1')
it('works')
it('should work correctly')
```

---

## Mocking Strategy

### External Dependencies

```typescript
// Mock database repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock external API
const mockGoogleSheetsApi = {
  getSpreadsheets: jest.fn(),
  readSheet: jest.fn(),
  writeSheet: jest.fn(),
};

// Mock file system
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));
```

### Test Data Factories

```typescript
// user.factory.ts
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  name: 'Test User',
  role: UserRole.USER,
  ...overrides,
});

// Usage
const user = createMockUser({ email: 'custom@example.com' });
```

---

## Next Steps

1. **Phase 1**: Implement critical module tests (Auth, Users, Workspaces)
2. **Phase 2**: Core business logic tests (Statements, Parsing, Transactions)
3. **Phase 3**: Secondary features (Reports, Sheets, Custom Tables)
4. **Phase 4**: Utilities and edge cases
5. **Phase 5**: Integration and E2E tests

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Coverage Goals](https://martinfowler.com/bliki/TestCoverage.html)

---

<div align="center">

**Last Updated**: January 14, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation

</div>
