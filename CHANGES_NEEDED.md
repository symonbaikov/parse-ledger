# Necessary Changes for "FinFlow" Workflow Support

Based on user feedback regarding the "New Version" workflow, the following changes are required to support manual data entry and expense distribution.

## 1. Enable Manual Categorization (Distributing Expenses)
**Current Issue:** The `EditStatementPage` (`/statements/[id]/edit`) displays the category but does not allow changing it in the edit mode. Users cannot manually "distribute" expenses if auto-classification fails.

**Tasks:**
- [ ] **Frontend - Data Loading:** Fetch lists of `Categories`, `Branches`, and `Wallets` in `EditStatementPage`.
- [ ] **Frontend - Editable Columns:** Add `categoryId`, `branchId`, and `walletId` to the editable fields.
- [ ] **Frontend - UI Components:** Implement `Select` (Dropdown) components in the `renderEditCell` function for Category, Branch, and Wallet columns.
- [ ] **Backend (Verify):** Ensure `PUT /transactions/:id` accepts and updates `categoryId`, `branchId`, and `walletId`.

## 2. Manual Entry of Initial Turnovers (Opening Balance)
**Current Issue:** Initial balances (`balanceStart`) are automatically extracted from files (like PDF) and displayed in "Parsing Details", but they are read-only. If the user uploads a CSV or the extraction fails, they cannot set the initial turnover.
    
**Tasks:**
- [ ] **Frontend - Metadata Section:** Convert the "Parsing Details" or a new "Statement Info" section into an editable form.
- [ ] **Frontend - Edit Fields:** Allow editing `balanceStart`, `balanceEnd`, `statementDateFrom`, and `statementDateTo`.
- [ ] **Backend - API:** Create or Update endpoint `PATCH /statements/:id` to allow updating these metadata fields manually.

## 3. Bulk Categorization (Optimization)
**Current Issue:** Distributing expenses one by one is slow.

**Tasks:**
- [ ] **Frontend - Bulk Actions:** Add a "Assign Category" button to the selected rows toolbar.
- [ ] **Frontend - Bulk Dialog:** Create a modal to select a category and apply it to all selected transactions.
- [ ] **Frontend - Implementation:** Trigger the existing bulk update API or create a specific one for categorization.

## 4. Workflow Clarity ("How to work?")
**Current Issue:** The user is unsure "where to distribute".

**Tasks:**
- [ ] **Frontend - Visual Cues:** Highlight transactions with `missing` categories (e.g., yellow background or warning icon).
- [ ] **Frontend - Navigation:** Ensure the flow from "Upload" immediately suggests "Review & Categorize".
