# Implementation Context: Code Analysis & Issues Found

This document provides detailed context for the implementation plan, including all issues found, their severity, and the rationale for proposed fixes.

---

## Table of Contents

1. [Code Quality Issues](#code-quality-issues)
2. [Testing Gaps](#testing-gaps)
3. [Documentation Issues](#documentation-issues)
4. [Priority Matrix](#priority-matrix)
5. [Detailed Issue Analysis](#detailed-issue-analysis)

---

## Code Quality Issues

### Summary Statistics
- **Total Issues Found**: 27
- **DRY Violations**: 3 major
- **SOLID Violations**: 3 major
- **Unused Code**: 2 functions
- **Missing Error Handling**: 3 critical areas
- **Magic Numbers/Strings**: 4 instances
- **Separation of Concerns**: 3 violations

---

## Testing Gaps

### Critical Missing Tests (HIGH PRIORITY)
1. `copyRecurrentBudgets.ts` - Complex business logic, 0% coverage
2. `exportImport.ts` - Data integrity critical, 0% coverage
3. `initializeDefaults.ts` - Idempotency critical, 0% coverage
4. `resetDatabase.ts` - Destructive operation, 0% coverage

### Existing Tests (GOOD)
1. ✅ `date.test.ts` - Well-structured
2. ✅ `format.test.ts` - Good coverage
3. ✅ `useBudgetCalculations.test.ts` - Multiple scenarios

### Files That DON'T Need Tests
- Type definitions (`types/index.ts`)
- Constants files
- Simple styled components
- Bootstrap files (main.tsx, App.tsx)

---

## Documentation Issues

### Redundancy Score
- README.md ↔ technical-context.md: **60% overlap**
- product-context.md ↔ technical-context.md: **45% overlap**
- CHANGELOG.md: **Not a real changelog** (describes features, not changes)

### Over-Documentation
- technical-context.md: **584 lines** (should be ~300)
- Code examples in docs instead of actual code
- Excessive detail on implementation vs. decisions

---

## Priority Matrix

### Immediate Actions (High Impact, Low Effort)
| Issue | File | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| Delete unused generateId | id.ts | Low | 5 min | P1 |
| Delete unused parseNumber | format.ts | Low | 5 min | P1 |
| Create date utilities | date.ts | High | 20 min | P1 |
| Add storage constants | constants/storage.ts | Medium | 10 min | P1 |
| Consolidate reset functions | Multiple | Medium | 15 min | P1 |

### Short Term (High Impact, Medium Effort)
| Issue | File | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| Test copyRecurrentBudgets | New test file | High | 2 hours | P2 |
| Test exportImport | New test file | High | 1.5 hours | P2 |
| Test initializeDefaults | New test file | Medium | 1 hour | P2 |
| Test resetDatabase | New test file | Medium | 45 min | P2 |
| Add error handling | Multiple | High | 2 hours | P2 |

### Medium Term (Medium Impact, High Effort)
| Issue | File | Impact | Effort | Priority |
|-------|------|--------|--------|----------|
| Extract BudgetEditor components | BudgetEditor.tsx | Medium | 4 hours | P3 |
| Extract cash register hook | New hook file | Medium | 2 hours | P3 |
| Restructure documentation | Multiple docs | Medium | 3 hours | P3 |
| Split AppContext | AppContext.tsx | Medium | 4 hours | P3 |

---

## Detailed Issue Analysis

### DRY-001: Duplicate formatCurrency Functions

**Location:**
- `src/utils/format.ts:1-6`
- `src/components/budget/BudgetEditor.tsx:96-109`

**Problem:**
```typescript
// In utils/format.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// In BudgetEditor.tsx (line 105)
const formatCurrency = (cents: number): string => {
  const reais = cents / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais)
}
```

**Why it's a problem:**
1. The BudgetEditor import on line 3 (`import { formatCurrency } from '@/utils/format'`) is shadowed by the local definition
2. Two different signatures: one takes `number` (reais), one takes `number` (cents)
3. Inconsistent usage across the app
4. If formatting logic needs to change, must update multiple places

**Impact:** Medium - Causes confusion and maintenance burden

**Fix:**
Rename local functions in BudgetEditor:
```typescript
const formatCentsAsCurrency = (cents: number): string => {
  return formatCurrency(cents / 100)
}
```

---

### DRY-002: Redundant Reset Functions

**Location:**
- `src/utils/exportImport.ts:65-72` - `resetAllData()`
- `src/utils/resetDatabase.ts:5-29` - `resetDatabase()`

**Problem:**
```typescript
// exportImport.ts
export const resetAllData = async (): Promise<void> => {
  await db.transaction('rw', db.categories, db.sources, db.budgets, db.transactions, async () => {
    await db.categories.clear()
    await db.sources.clear()
    await db.budgets.clear()
    await db.transactions.clear()
  })
}

// resetDatabase.ts
export const resetDatabase = async (): Promise<void> => {
  // Clears data THEN reinitializes defaults
  await db.transactions.clear()
  // ...
  await initializeDefaultData()
}
```

**Why it's a problem:**
1. `resetAllData` name suggests it resets to defaults, but it doesn't
2. Two similar functions with different behavior creates confusion
3. `useBackup.ts` uses `resetAllData` but users likely expect defaults to be restored
4. Violates DRY principle

**Impact:** High - User confusion, incorrect behavior

**Fix:**
Delete `resetAllData` from exportImport.ts, use only `resetDatabase`

---

### DRY-003: Duplicate Date-to-Number Conversion

**Location:**
- `src/utils/copyRecurrentBudgets.ts` - 6 instances
- `src/components/budget/BudgetEditor.tsx` - 8 instances

**Problem:**
```typescript
// Pattern appears 14+ times across codebase:
const currentDate = year * 12 + month
const budgetDate = b.year * 12 + b.month
```

**Why it's a problem:**
1. Magic number 12 without explanation
2. Logic duplicated 14+ times
3. If calculation needs adjustment, must update everywhere
4. Error-prone (easy to forget to handle month 0/12 edge cases)

**Impact:** Medium - Maintainability and clarity

**Fix:**
```typescript
// Add to src/utils/date.ts
export const dateToMonthNumber = (year: number, month: number): number => {
  return year * 12 + month
}

export const monthNumberToDate = (monthNum: number): { year: number; month: number } => {
  const year = Math.floor(monthNum / 12)
  const month = monthNum % 12
  return { year, month: month === 0 ? 12 : month }
}

// Usage:
const currentDate = dateToMonthNumber(year, month)
const budgetDate = dateToMonthNumber(b.year, b.month)
```

---

### SOLID-001: Single Responsibility Violation - BudgetEditor

**Location:** `src/components/budget/BudgetEditor.tsx` (642 lines)

**Problem:** Component has too many responsibilities:

1. **State Management** (lines 15-20):
   - budgetValues, rawCentValues, focusedField
   - budgetModes, installmentCounts
   - expandedCategories

2. **Database Operations** (lines 290-378):
   - Direct db imports and queries
   - Complex delete logic
   - Budget creation/update

3. **Cash Register Logic** (lines 137-165):
   - Keyboard input handling
   - Cent-to-currency conversion
   - Focus/blur management

4. **Currency Formatting** (lines 96-134):
   - Multiple formatting functions
   - Display value calculation

5. **UI Rendering** (lines 434-640):
   - Income section
   - Expense section with categories
   - Summary footer

**Cyclomatic Complexity:** Estimated 25+ (should be <10)

**Why it's a problem:**
1. Testing individual concerns is difficult
2. Changes to one feature risk breaking others
3. Cannot reuse logic elsewhere
4. Hard to understand code flow
5. Violates Single Responsibility Principle

**Impact:** High - Maintainability nightmare

**Fix Strategy:**
```
BudgetEditor (main component)
├── useBudgetEditor (hook for state management)
├── useCashRegisterInput (hook for cash register logic)
├── BudgetIncomeSection (component)
├── BudgetExpenseSection (component)
│   └── BudgetCategoryRow (component for each category)
├── BudgetSummaryFooter (component)
└── src/utils/budgetOperations.ts (delete logic)
```

---

### SOLID-002: Single Responsibility Violation - AppContext

**Location:** `src/context/AppContext.tsx`

**Problem:** Provides 31 different values/functions:
- 4 entity collections (categories, sources, transactions, budgets)
- 12 CRUD operations (3 per entity × 4)
- 4 refresh methods
- 2 date selection values + setters

**Why it's a problem:**
1. **Performance**: Any state change causes ALL consumers to re-render
2. **Testing**: Difficult to test individual concerns
3. **Separation**: Mixing unrelated concerns
4. **Complexity**: Hard to understand dependencies

**Impact:** High - Performance and maintainability

**Example of problem:**
```typescript
// Component only needs categories, but gets EVERYTHING
const { categories } = useApp()
// This re-renders when transactions, budgets, or sources change!
```

**Fix Strategy:**
Split into focused contexts:
```typescript
// Separate contexts
<CategoriesProvider>
<SourcesProvider>
<TransactionsProvider>
<BudgetsProvider>
<DateSelectionProvider>
  <App />
</DateSelectionProvider>
</BudgetsProvider>
</TransactionsProvider>
</SourcesProvider>
</CategoriesProvider>

// Usage:
const { categories, addCategory } = useCategories()
// Only re-renders when categories change
```

---

### SOLID-003: Open/Closed Principle Violation - Budget Modes

**Location:**
- `src/utils/copyRecurrentBudgets.ts:75-116`
- `src/components/budget/BudgetEditor.tsx:284-378`

**Problem:**
Hard-coded mode checks scattered across files:

```typescript
if (mode === 'recurring') {
  // recurring logic
} else if (mode === 'installment') {
  // installment logic
}
```

**Why it's a problem:**
Adding a new budget mode (e.g., "quarterly") requires:
1. Modifying `copyRecurrentBudgets.ts`
2. Modifying `BudgetEditor.tsx` delete logic
3. Updating constants
4. Updating types
5. Updating tests

Not extensible - violates Open/Closed Principle

**Impact:** Medium - Future flexibility

**Fix Strategy (Strategy Pattern):**
```typescript
interface BudgetModeStrategy {
  shouldCopyToFuture(budget: Budget, targetDate: number): boolean
  handleDelete(budget: Budget, currentDate: number): Promise<void>
  getDisplayLabel(): string
}

class RecurringBudgetStrategy implements BudgetModeStrategy {
  shouldCopyToFuture() { return true }
  handleDelete() { /* specific logic */ }
}

class InstallmentBudgetStrategy implements BudgetModeStrategy {
  shouldCopyToFuture(budget, targetDate) {
    return targetDate < budget.installments
  }
  handleDelete() { /* specific logic */ }
}

// Factory
const getStrategy = (mode: BudgetMode): BudgetModeStrategy => {
  switch(mode) {
    case 'recurring': return new RecurringBudgetStrategy()
    case 'installment': return new InstallmentBudgetStrategy()
    default: return new UniqueBudgetStrategy()
  }
}
```

---

### UNUSED-001: generateId Function

**Location:** `src/utils/id.ts`

**Problem:**
```typescript
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

Never imported or used anywhere in the codebase.

**Why it exists:**
Likely created early in development, before using IndexedDB auto-increment

**Current ID strategy:**
```typescript
// In db/index.ts
categories: '++id, name, parentId'  // ++id means auto-increment
```

**Impact:** Low - Just dead code

**Fix:** Delete the entire file

---

### UNUSED-002: parseNumber Function

**Location:** `src/utils/format.ts:12-16`

**Problem:**
```typescript
export const parseNumber = (value: string): number => {
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
```

Only used in test file, never in production code.

**Original use case:** Likely for parsing user input, but BudgetEditor uses cash register pattern instead

**Impact:** Low - Maintaining unused code and tests

**Fix:** Delete function and its tests

---

### ERROR-001: No Error Handling in copyRecurrentBudgets

**Location:** `src/utils/copyRecurrentBudgets.ts`

**Problem:**
```typescript
// Lines 90, 112 - No try-catch
await db.budgets.add(newBudget)
```

If database operation fails:
- Error silently propagates
- User gets no feedback
- Partial budget copies possible (inconsistent state)

**Impact:** High - Data integrity risk

**Fix:**
```typescript
export const copyRecurrentBudgets = async (
  year: number,
  month: number
): Promise<{ success: boolean; copiedCount: number; error?: Error }> => {
  try {
    // ... existing logic ...
    return { success: true, copiedCount }
  } catch (error) {
    console.error('Failed to copy recurrent budgets:', error)
    return {
      success: false,
      copiedCount: 0,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}
```

---

### ERROR-002: Inadequate Error Handling in exportImport

**Location:** `src/utils/exportImport.ts`

**Problems:**

1. **exportData (lines 4-27):** No try-catch at all
```typescript
export const exportData = async (): Promise<void> => {
  const categories = await db.categories.toArray()  // Could fail
  // ... no error handling
}
```

2. **importData (lines 29-63):** Minimal validation
```typescript
if (!data.version || !data.categories || !data.sources || !data.budgets || !data.transactions) {
  throw new Error('Invalid backup file format')
}
// Only checks existence, not types or structure
```

**What could go wrong:**
- Corrupt backup files crash the app
- Invalid data types (e.g., string where number expected) imported
- Referential integrity violated (transaction references deleted category)
- User doesn't know what went wrong

**Impact:** High - Data loss risk

**Fix:**
```typescript
// Add schema validation
import { z } from 'zod'

const AppDataSchema = z.object({
  version: z.number(),
  categories: z.array(CategorySchema),
  sources: z.array(SourceSchema),
  budgets: z.array(BudgetSchema),
  transactions: z.array(TransactionSchema),
})

export const importData = async (file: File): Promise<void> => {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Validate schema
    const validated = AppDataSchema.parse(data)

    // Validate referential integrity
    validateReferences(validated)

    // Import
    await db.transaction('rw', /* ... */)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid backup file: ${error.message}`)
    }
    throw error
  }
}
```

---

### ERROR-003: Missing Error Handling in AppContext

**Location:** `src/context/AppContext.tsx:78-136`

**Problem:**
All CRUD operations have no error handling:

```typescript
const addCategory = async (category: Omit<Category, 'id'>) => {
  await db.categories.add(category)  // Could fail
  await refreshCategories()  // Could fail
}
```

**What happens on failure:**
- Silent failure
- UI doesn't update (or shows stale data)
- User doesn't know operation failed
- State becomes inconsistent

**Impact:** High - Poor UX and reliability

**Fix:**
```typescript
const [error, setError] = useState<string | null>(null)

const addCategory = async (category: Omit<Category, 'id'>) => {
  try {
    setError(null)
    await db.categories.add(category)
    await refreshCategories()
  } catch (err) {
    const message = 'Failed to add category'
    console.error(message, err)
    setError(message)
    // Optional: Show toast notification
    throw err
  }
}

// Add to context value:
// error, clearError
```

---

### SEPARATION-001: Direct Database Access in Component

**Location:** `src/components/budget/BudgetEditor.tsx:6, 290-378`

**Problem:**
```typescript
import { db } from '@/db'  // Component imports database directly

// Later in component:
const handleDeleteBudget = async () => {
  await db.budgets.delete(budgetId)  // Direct database call
  // Context state now out of sync!
}
```

**Why it's a problem:**
1. Violates layer separation (UI → Database, skips business logic layer)
2. Cannot mock in tests
3. Context state gets out of sync
4. Difficult to add validation or side effects

**Impact:** Medium - Architecture violation

**Fix:**
```typescript
// In AppContext.tsx, add:
const deleteBudgetWithHistory = async (id: number, options: DeleteOptions) => {
  // All deletion logic here
  await db.budgets.delete(id)
  // ... retroactive updates ...
  await refreshBudgets()
}

// In BudgetEditor.tsx:
const { deleteBudgetWithHistory } = useApp()
const handleDelete = () => deleteBudgetWithHistory(budgetId, { convertPast: true })
```

---

### SEPARATION-002: Business Logic in React Hook

**Location:** `src/hooks/useBudgetCalculations.ts`

**Problem:**
Calculation logic tightly coupled to React:

```typescript
export const useBudgetCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number,
  month: number
) => {
  const monthSummary = useMemo(() => {
    // Pure calculation logic here
    // But can't reuse outside React
  }, [dependencies])
}
```

**Why it's a problem:**
1. Cannot reuse calculations in non-React contexts (e.g., Node.js script, tests)
2. Testing requires React Testing Library
3. Business logic should be framework-agnostic

**Impact:** Low - Minor architectural issue

**Fix:**
```typescript
// src/utils/budgetCalculations.ts (pure functions)
export const calculateMonthSummary = (
  transactions: Transaction[],
  budgets: Budget[],
  year: number,
  month: number
): MonthSummary => {
  // Pure calculation logic
  // No React dependencies
}

// src/hooks/useBudgetCalculations.ts (thin wrapper)
export const useBudgetCalculations = (/* ... */) => {
  return useMemo(
    () => calculateMonthSummary(transactions, budgets, year, month),
    [transactions, budgets, year, month]
  )
}
```

---

### SEPARATION-003: UI Concerns in Data Layer

**Location:** `src/utils/copyRecurrentBudgets.ts:53, 120`

**Problem:**
```typescript
console.log(`📋 Found ${budgetMap.size} unique recurring/installment budgets`)
console.log(`✅ Copied ${copiedCount} budgets to ${year}-${month}`)
```

Data utility function contains UI logging.

**Why it's a problem:**
1. Violates separation of concerns
2. Cannot control logging from outside
3. Pollutes console in production
4. Makes function impure (side effects)

**Impact:** Low - Minor code smell

**Fix:**
```typescript
export const copyRecurrentBudgets = async (
  year: number,
  month: number
): Promise<{ copiedCount: number; foundCount: number }> => {
  // ... logic ...

  return {
    copiedCount,
    foundCount: budgetMap.size
  }
}

// Caller decides whether to log:
const result = await copyRecurrentBudgets(year, month)
if (result.copiedCount > 0) {
  console.log(`Copied ${result.copiedCount} budgets`)
}
```

---

### MAGIC-001: Month Calculation Magic Number

**Location:** Multiple files

**Problem:** `year * 12 + month` pattern without explanation

**Already covered in DRY-003**

---

### MAGIC-002: Default Installment Count

**Location:** `src/components/budget/BudgetEditor.tsx:182, 442, 551`

**Problem:**
```typescript
const [installmentCounts, setInstallmentCounts] = useState<Record<string, number>>({})

// Later:
const currentInstallments = installmentCounts[key] || 2  // Magic number 2
```

Number 2 appears in 3 places without explanation.

**Impact:** Low - Minor issue

**Fix:**
```typescript
// In src/constants/budgetModes.ts
export const DEFAULT_INSTALLMENT_COUNT = 2

// Usage:
const currentInstallments = installmentCounts[key] || DEFAULT_INSTALLMENT_COUNT
```

---

### MAGIC-003: String Literal Mode Checks

**Location:** `copyRecurrentBudgets.ts`, `BudgetEditor.tsx`

**Problem:**
```typescript
if (b.mode === 'recurring')  // String literal
if (mode === 'installment')  // String literal
```

Constants exist but not used consistently:

```typescript
// constants/budgetModes.ts has:
export const BUDGET_MODES = {
  UNIQUE: 'unique',
  RECURRING: 'recurring',
  INSTALLMENT: 'installment',
}
```

**Impact:** Low - Missed type safety opportunity

**Fix:**
```typescript
import { BUDGET_MODES } from '@/constants/budgetModes'

if (b.mode === BUDGET_MODES.RECURRING)
if (mode === BUDGET_MODES.INSTALLMENT)

// Better: Type guards
const isRecurringBudget = (b: Budget) => b.mode === BUDGET_MODES.RECURRING
const isInstallmentBudget = (b: Budget) => b.mode === BUDGET_MODES.INSTALLMENT
```

---

### MAGIC-004: localStorage Key Duplication

**Location:**
- `src/utils/initializeDefaults.ts:4, 8, 20, 54`
- `src/utils/resetDatabase.ts:3, 16`

**Problem:**
```typescript
const INIT_FLAG_KEY = 'budget-tracker-initialized'  // Defined twice
```

String appears in 2 files (6 total references).

**Impact:** Low - Minor duplication

**Fix:**
```typescript
// Create src/constants/storage.ts
export const STORAGE_KEYS = {
  INIT_FLAG: 'budget-tracker-initialized',
} as const

// Usage in both files:
import { STORAGE_KEYS } from '@/constants/storage'
localStorage.getItem(STORAGE_KEYS.INIT_FLAG)
```

---

## Testing Gaps - Detailed Context

### Why copyRecurrentBudgets.ts Needs Tests

**Complexity Score:** High
- Date calculations
- Map data structures
- Multiple filtering conditions
- Database operations
- Legacy field support

**Edge Cases to Test:**
1. **Year Rollover:** December 2024 → January 2025
2. **Skipped Months:** Budget in Jan, check in Apr (should copy to Feb, Mar, Apr)
3. **Multiple Budgets Same Category:** Should use most recent
4. **Installment Boundary:** Month 11 of 12-month installment should copy; month 13 should not
5. **Legacy Support:** Old budgets with `isRecurrent: true` but no `mode`
6. **Empty Arrays:** No budgets should not crash
7. **No Previous Budgets:** Only current month budgets exist
8. **Existing Budget Conflict:** Don't overwrite manually edited budgets

**Test Example:**
```typescript
describe('copyRecurrentBudgets', () => {
  it('should copy recurring budget across year boundary', async () => {
    // Arrange: Create recurring budget in Dec 2024
    await db.budgets.add({
      year: 2024,
      month: 12,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      mode: 'recurring'
    })

    // Act: Copy to Jan 2025
    await copyRecurrentBudgets(2025, 1)

    // Assert: Budget exists in Jan 2025
    const jan2025Budgets = await db.budgets
      .where('[year+month]')
      .equals([2025, 1])
      .toArray()

    expect(jan2025Budgets).toHaveLength(1)
    expect(jan2025Budgets[0].amount).toBe(1500)
    expect(jan2025Budgets[0].mode).toBe('recurring')
  })
})
```

---

### Why exportImport.ts Needs Tests

**Critical User Data:** Backups are users' only safety net

**Data Integrity Risks:**
1. Corrupted export loses all data
2. Invalid import corrupts database
3. Partial import leaves inconsistent state
4. Missing validation allows bad data

**Test Scenarios:**
1. **Happy Path:** Export → Import → Verify all data identical
2. **Large Dataset:** 1000+ transactions, 100+ budgets
3. **Empty Database:** Export empty DB, verify structure
4. **Invalid JSON:** Import corrupt file, expect rejection
5. **Missing Fields:** Import file without `transactions`, expect error
6. **Type Mismatch:** Import string where number expected
7. **Referential Integrity:** Transaction references non-existent category
8. **Version Mismatch:** Import v2 file into v1 schema

**Test Example:**
```typescript
describe('exportImport', () => {
  it('preserves all data in round-trip export/import', async () => {
    // Arrange: Create test data
    const categoryId = await db.categories.add({ name: 'Test' })
    await db.transactions.add({
      type: 'expense',
      value: 100,
      date: '2024-03-15',
      groupId: categoryId
    })

    // Act: Export
    const exported = await exportToJSON()  // Need to create this helper

    // Clear database
    await db.transaction('rw', db.categories, db.transactions, async () => {
      await db.categories.clear()
      await db.transactions.clear()
    })

    // Import
    await importFromJSON(exported)

    // Assert: Data matches
    const categories = await db.categories.toArray()
    const transactions = await db.transactions.toArray()

    expect(categories).toHaveLength(1)
    expect(categories[0].name).toBe('Test')
    expect(transactions).toHaveLength(1)
    expect(transactions[0].value).toBe(100)
  })
})
```

---

## Documentation Redundancy Analysis

### Overlap Matrix

|  | README | product-context | technical-context | CHANGELOG |
|--|--------|-----------------|-------------------|-----------|
| **Features list** | ✓ | ✓✓ | ✓ | ✓ |
| **Tech stack** | ✓ | - | ✓✓ | - |
| **Project structure** | ✓ | - | ✓✓ | - |
| **Setup instructions** | ✓✓ | - | ✓ | - |
| **Budget modes** | - | ✓✓ | ✓✓ | ✓ |
| **Testing guidelines** | ✓ | - | ✓✓ | - |
| **Data storage** | ✓ | ✓ | ✓✓ | - |
| **Default categories** | ref | ✓✓ | - | - |

**Legend:**
- ✓ = Mentioned
- ✓✓ = Detailed description
- ref = Reference to other doc
- - = Not mentioned

### Recommended Content Distribution

**README.md** (User-facing, ~100 lines):
- What it is
- Quick start
- Key features (bullet list)
- Links to docs/

**docs/ARCHITECTURE.md** (Developer-facing):
- System design
- Technology choices WHY
- Data model
- State management

**docs/FEATURES.md** (Product spec):
- User flows
- Business rules
- Default data
- Feature details

**docs/DEVELOPMENT.md** (Contributing guide):
- Setup
- Conventions
- Testing approach
- Common tasks

**CHANGELOG.md** (Version history):
- Actual changes over time
- Dates and versions
- Breaking changes

---

## Complexity Analysis

### Function Complexity Scores (Estimated)

| Function | Lines | Cyclomatic Complexity | Priority to Refactor |
|----------|-------|----------------------|---------------------|
| BudgetEditor.handleDeleteBudget | 131 | 18 | P1 - High |
| BudgetEditor.render | 206 | 15 | P2 - Medium |
| copyRecurrentBudgets | 123 | 12 | P3 - Low |
| BudgetEditor.handleKeyDown | 29 | 8 | P3 - Low |

**Target:** All functions should have complexity < 10

---

## Implementation Risk Assessment

### Low Risk Changes (Safe to do first)
- ✅ Delete unused code
- ✅ Add constants
- ✅ Add utility functions
- ✅ Add tests (doesn't change code)
- ✅ Add JSDoc comments

### Medium Risk Changes (Test thoroughly)
- ⚠️ Consolidate reset functions
- ⚠️ Add error handling
- ⚠️ Rename functions
- ⚠️ Extract hooks

### High Risk Changes (Do last, with caution)
- 🔴 Split AppContext
- 🔴 Refactor BudgetEditor component
- 🔴 Change database operations

---

## Success Metrics

### Code Quality Metrics
- [ ] Cyclomatic complexity < 10 for all functions
- [ ] 0 unused exports (via ts-prune or similar)
- [ ] 100% JSDoc coverage on exported functions
- [ ] 0 console.log in production utilities

### Test Coverage Metrics
- [ ] >80% coverage on critical utilities
- [ ] All business logic has behavioral tests
- [ ] 0 implementation detail tests

### Documentation Metrics
- [ ] 0 duplicate content across docs
- [ ] README < 150 lines
- [ ] Each doc serves single purpose
- [ ] All docs have last-updated date

---

## Rollback Plan

If issues arise:

1. **Each phase should be a separate commit**
2. **Run tests after each change**
3. **To rollback:** `git revert <commit-hash>`

**Critical commits to tag:**
- `v1-before-refactor` - Tag before starting
- `v1-phase1-cleanup` - After Phase 1
- `v1-phase2-utilities` - After Phase 2
- etc.

---

## Additional Context

### Current File Structure
```
src/
├── components/
│   ├── budget/
│   │   └── BudgetEditor.tsx (642 lines) ⚠️
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── setup/
│   └── transactions/
├── constants/
│   ├── budgetModes.ts ✓
│   ├── paymentMethods.ts ✓
│   └── transactionModes.ts ✓
├── context/
│   └── AppContext.tsx (179 lines) ⚠️
├── db/
│   └── index.ts (28 lines) ✓
├── hooks/
│   ├── useBackup.ts
│   └── useBudgetCalculations.ts (77 lines) ✓
├── types/
│   └── index.ts (66 lines) ✓
└── utils/
    ├── copyRecurrentBudgets.ts (123 lines) ⚠️ NO TESTS
    ├── date.ts (42 lines) ✓ HAS TESTS
    ├── defaultData.ts (49 lines) ✓
    ├── exportImport.ts (73 lines) ⚠️ NO TESTS
    ├── format.ts (17 lines) ✓ HAS TESTS
    ├── id.ts (4 lines) ❌ UNUSED
    ├── initializeDefaults.ts (60 lines) ⚠️ NO TESTS
    └── resetDatabase.ts (30 lines) ⚠️ NO TESTS
```

**Legend:**
- ✓ = Good state
- ⚠️ = Needs attention
- ❌ = Delete

---

This context document provides all the necessary background to understand and execute the implementation plan. Reference specific sections as needed during implementation.
