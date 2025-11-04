# Implementation Plan: Code Quality & Testing Improvements

## Overview
This plan addresses code quality issues, DRY violations, missing tests, and documentation redundancies found in the personal finance application codebase.

---

## Phase 1: Quick Wins (Delete Unused Code)

### 1.1 Delete Unused ID Generator
**Files to modify:**
- Delete `src/utils/id.ts`

**Reason:** The `generateId` function is never used. IndexedDB auto-increments IDs.

### 1.2 Delete Unused parseNumber Function
**Files to modify:**
- `src/utils/format.ts` - Remove `parseNumber` function (lines 12-16)
- `src/utils/__tests__/format.test.ts` - Remove parseNumber tests (lines 37-47)

**Reason:** Function is tested but never used in production code.

---

## Phase 2: DRY Violations & Utilities

### 2.1 Create Date Utility Functions
**Files to modify:**
- `src/utils/date.ts`

**Add these functions:**
```typescript
/**
 * Converts a year and month to a linear month number for easy comparison
 * Example: 2024, 3 -> 24291 (2024 * 12 + 3)
 */
export const dateToMonthNumber = (year: number, month: number): number => {
  return year * 12 + month
}

/**
 * Converts a linear month number back to year and month
 * Example: 24291 -> { year: 2024, month: 3 }
 */
export const monthNumberToDate = (monthNum: number): { year: number; month: number } => {
  const year = Math.floor(monthNum / 12)
  const month = monthNum % 12
  return { year, month: month === 0 ? 12 : month }
}
```

**Files to update to use these:**
- `src/utils/copyRecurrentBudgets.ts` - Replace all `year * 12 + month` patterns
- `src/components/budget/BudgetEditor.tsx` - Replace all date calculations

### 2.2 Create Storage Constants File
**Create new file:** `src/constants/storage.ts`

```typescript
export const STORAGE_KEYS = {
  INIT_FLAG: 'budget-tracker-initialized',
} as const
```

**Files to update:**
- `src/utils/initializeDefaults.ts` - Import and use `STORAGE_KEYS.INIT_FLAG`
- `src/utils/resetDatabase.ts` - Import and use `STORAGE_KEYS.INIT_FLAG`

### 2.3 Add Default Installment Count Constant
**Files to modify:**
- `src/constants/budgetModes.ts`

**Add:**
```typescript
export const DEFAULT_INSTALLMENT_COUNT = 2
```

**Files to update:**
- `src/components/budget/BudgetEditor.tsx` - Replace hardcoded `2` with constant

### 2.4 Consolidate Reset Functions
**Files to modify:**
- Delete `resetAllData` from `src/utils/exportImport.ts` (lines 65-72)
- Keep `resetDatabase` in `src/utils/resetDatabase.ts` as the single source of truth
- `src/hooks/useBackup.ts` - Update import to use `resetDatabase` instead

### 2.5 Rename Currency Formatters in BudgetEditor
**Files to modify:**
- `src/components/budget/BudgetEditor.tsx`

**Changes:**
- Rename `formatCurrency` (line 105) to `formatCentsAsCurrency`
- Rename `formatCurrencyValue` (line 96) to `formatCentsAsDisplayString`
- Update all references to use the centralized `formatCurrency` from utils where appropriate

---

## Phase 3: Critical Missing Tests (Behavior-focused)

### 3.1 Test copyRecurrentBudgets.ts
**Create:** `src/utils/__tests__/copyRecurrentBudgets.test.ts`

**Test cases to implement:**
1. Should copy recurring budgets to future months
2. Should copy installment budgets within period only
3. Should stop installment budgets after period ends
4. Should use most recent budget values when multiple exist
5. Should skip months that already have budgets
6. Should handle year rollover correctly (e.g., Dec 2024 -> Jan 2025)
7. Should handle legacy isRecurrent field
8. Should handle empty budget arrays gracefully
9. Should not copy unique budgets
10. Should handle budgets from distant past

**Testing approach:** Use Vitest with mocked Dexie database

### 3.2 Test exportImport.ts
**Create:** `src/utils/__tests__/exportImport.test.ts`

**Test cases to implement:**
1. Export creates valid JSON structure with version
2. Export includes all tables (categories, sources, budgets, transactions)
3. Import rejects files with invalid format
4. Import rejects files with missing required fields
5. Import clears existing data before importing
6. Round-trip export/import preserves all data
7. Import handles empty arrays correctly
8. Export/import handles large datasets
9. Import rejects corrupt JSON gracefully

**Testing approach:** Integration tests with fake IndexedDB

### 3.3 Test initializeDefaults.ts
**Create:** `src/utils/__tests__/initializeDefaults.test.ts`

**Test cases to implement:**
1. Should initialize defaults on first run
2. Should not reinitialize if localStorage flag exists
3. Should not reinitialize if data already exists
4. Should create all 9 parent categories
5. Should create all subcategories with correct parentId
6. Should create all 4 default sources
7. Should set localStorage flag after initialization
8. Should handle database errors gracefully

**Testing approach:** Integration tests with mocked localStorage and database

### 3.4 Test resetDatabase.ts
**Create:** `src/utils/__tests__/resetDatabase.test.ts`

**Test cases to implement:**
1. Should clear all four tables (categories, sources, budgets, transactions)
2. Should clear localStorage initialization flag
3. Should reinitialize with default data after clearing
4. Should leave database in consistent state after reset
5. Should throw/handle errors during clear operations
6. Verify all default categories and sources are present after reset

**Testing approach:** Integration tests with real Dexie operations

---

## Phase 4: Error Handling

### 4.1 Add Error Handling to copyRecurrentBudgets
**Files to modify:**
- `src/utils/copyRecurrentBudgets.ts`

**Changes:**
- Wrap database operations in try-catch
- Return success/failure status: `Promise<{ success: boolean; copiedCount: number; error?: Error }>`
- Remove console.log statements (replace with return metadata)
- Add JSDoc with error documentation

### 4.2 Add Error Handling to exportImport
**Files to modify:**
- `src/utils/exportImport.ts`

**Changes:**
- Add try-catch to `exportData` function
- Improve error messages in `importData` (be specific about what failed)
- Add data validation before import (check types, not just existence)
- Consider using Zod for schema validation (optional - can be future enhancement)

### 4.3 Add Error Handling to AppContext
**Files to modify:**
- `src/context/AppContext.tsx`

**Changes:**
- Wrap all CRUD operations (lines 78-136) in try-catch blocks
- Log errors with context information
- Consider adding error state to context
- Show user-friendly error notifications (can use toast library)

---

## Phase 5: Code Organization

### 5.1 Extract Cash Register Input Hook
**Create:** `src/hooks/useCashRegisterInput.ts`

**Extract from BudgetEditor:**
- Cash register logic (lines 137-165)
- State management for raw cent values
- Keyboard event handlers

**Return interface:**
```typescript
{
  displayValue: string
  handleKeyDown: (e: KeyboardEvent) => void
  handleBlur: () => void
  reset: () => void
}
```

### 5.2 Extract Budget Delete Operations
**Create:** `src/utils/budgetOperations.ts`

**Extract from BudgetEditor:**
- Delete logic (lines 268-399)
- Break into smaller functions:
  - `findMatchingBudgets()`
  - `calculateBudgetDateRange()`
  - `convertPastBudgetsToUnique()`
  - `deleteFutureBudgets()`

### 5.3 Add JSDoc Comments
**Files to modify:**
- `src/utils/copyRecurrentBudgets.ts`
- `src/utils/exportImport.ts`
- `src/utils/initializeDefaults.ts`
- `src/utils/resetDatabase.ts`
- `src/utils/date.ts` (new functions)
- `src/utils/format.ts`

**Format:**
```typescript
/**
 * Brief description of what the function does
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 * @throws Error description (if applicable)
 * @example
 * functionName(exampleParam)
 */
```

### 5.4 Replace Magic Numbers
**Files to modify:**
- `src/utils/copyRecurrentBudgets.ts` - Use `dateToMonthNumber` utility
- `src/components/budget/BudgetEditor.tsx` - Use `dateToMonthNumber` and `DEFAULT_INSTALLMENT_COUNT`

---

## Phase 6: Documentation Cleanup

### 6.1 Streamline README
**Files to modify:**
- `README.md`

**Changes:**
- Remove duplicate tech stack details (keep brief, link to ARCHITECTURE.md)
- Remove duplicate project structure (link to ARCHITECTURE.md)
- Keep focused on: Quick start, key features, links to detailed docs
- Target length: ~100 lines

### 6.2 Consolidate Technical Documentation
**Create:** `docs/ARCHITECTURE.md` (extract from technical-context.md)

**Include:**
- System architecture
- Technology choices and rationale
- Data flow
- Database schema
- State management approach

**Modify:** `docs/technical-context.md`
- Remove redundant setup commands
- Reduce code examples (reference actual code instead)
- Shorten testing philosophy section
- Focus on "why" decisions, not "how" implementation

### 6.3 Restructure Feature Documentation
**Modify:** `docs/CHANGELOG.md`
- Rename to `docs/FEATURES.md`
- Move current content to describe features
- Create new `CHANGELOG.md` in root with proper version format

**Format for new CHANGELOG.md:**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial release features

### Changed

### Deprecated

### Removed

### Fixed
```

### 6.4 Add Inline Documentation
**Files to modify:**
- `src/components/budget/BudgetEditor.tsx` - Add comments explaining complex delete logic
- `src/utils/copyRecurrentBudgets.ts` - Add comments for date calculations and budget filtering logic

---

## Testing Guidelines

### Principles
- **ALWAYS TEST BEHAVIOR, NOT IMPLEMENTATION**
- Focus on what users see and experience
- Test data transformations and calculations
- Use accessible queries (getByRole, getByLabelText)
- Mock only external dependencies (database, file system)

### Test Structure
```typescript
describe('Feature/Function Name', () => {
  describe('specific behavior', () => {
    it('should do X when Y happens', () => {
      // Arrange: Set up test data
      // Act: Perform the action
      // Assert: Verify the outcome
    })
  })
})
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- copyRecurrentBudgets.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

---

## Execution Order

1. **Start with Phase 1** (delete unused code) - safest, no dependencies
2. **Then Phase 2** (utilities and constants) - creates foundation
3. **Then Phase 3** (tests) - validates refactoring safety
4. **Then Phase 4** (error handling) - improves reliability
5. **Then Phase 5** (code organization) - improves maintainability
6. **Finally Phase 6** (documentation) - captures all changes

---

## Success Criteria

- [ ] All tests pass
- [ ] No unused code remains
- [ ] All magic numbers replaced with constants/utilities
- [ ] Critical functions have >80% test coverage
- [ ] All exported functions have JSDoc comments
- [ ] Documentation is consolidated and non-redundant
- [ ] No regressions in existing functionality
- [ ] Build completes without errors or warnings

---

## Notes

- Each phase can be completed independently
- Test after each change to ensure nothing breaks
- Commit after each phase completion
- There is no need to maintain backward compatibility since this is the first release of the app
- No breaking changes to the public API
