# Personal Finance App - Comprehensive Overhaul Plan

**Generated**: 2025-11-06
**Scope**: Fix all 33 identified issues (Critical + Important + Minor)

---

## AUDIT SUMMARY

### Issues Found: 33 Total
- **5 Critical**: Build failures, test failures, blocking bugs
- **16 Important**: UX, accessibility, performance, documentation
- **12 Minor**: Documentation mismatches, optimizations, cleanup

---

## DETAILED ISSUE LIST

### 1. CRITICAL ISSUES (5)

#### 1.1 TypeScript Build Failure
- **File**: `tsconfig.json`
- **Issue**: Missing vitest type definitions causing build to fail
- **Error**: Test files can't find `describe`, `it`, `expect` globals
- **Fix**: Add `"types": ["vitest/globals"]` to compilerOptions

#### 1.2 Date Calculation Bug
- **File**: `src/utils/date.ts:74-78`
- **Function**: `monthNumberToDate`
- **Issue**: Off-by-one error in year calculation
- **Example**: monthNum=24288 (2024*12) returns {year: 2024, month: 12} instead of {year: 2023, month: 12}
- **Fix**: Change `Math.floor(monthNum / 12)` to `Math.floor((monthNum - 1) / 12)`

#### 1.3 Test Failures (6 tests)
- **File**: `src/hooks/__tests__/useTrendCalculations.test.ts`
  - Line 238: `periodSummary` returns 0 for totalExpense (expected non-zero)
  - Line 255: `varianceTrend` returns 6 months instead of 12 for monthsBack=12
  - Line 282: Cross-year periods return 1 month instead of 2
  - **Root cause**: Lines 71-87 in useTrendCalculations.ts filter out empty months

- **File**: `src/hooks/__tests__/useYearlyCalculations.test.ts`
  - Line 107: `monthlyBreakdowns` returns 3 months instead of 12
  - Line 133: Undefined access when checking empty month
  - Line 163: `isFuture` flag incorrectly set for past months
  - **Root cause**: Lines 71-74 skip empty months without data/budgets

#### 1.4 No Component/Integration Tests
- **Files**: No test coverage for critical components
- **Missing tests**:
  - TransactionForm (validation, installments, submission)
  - BudgetEditor (CRUD operations, recurrent budgets)
  - CategoryManager (expand/collapse, CRUD)
  - Modal (keyboard, focus, accessibility)
  - ErrorBoundary (error handling)
  - Integration tests for user flows

#### 1.5 Navbar Import No Loading State
- **File**: `src/components/layout/Navbar.tsx:94-100`
- **Issue**: File picker opens on every render when showImport is true
- **Issue**: No loading indicator during import
- **Issue**: Generic alert for errors (line 19) - no specific error message

---

### 2. IMPORTANT ISSUES (16)

#### 2.1 Documentation Inconsistencies

**README.md vs Code**:
- README mentions "Yearly Planning" but code uses inconsistent "Yearly" vs "Anual" terminology
- ViewMode constants changed: README implies 'monthly'/'yearly', but code uses VIEW_MODES.MONTH/VIEW_MODES.YEAR/VIEW_MODES.OVERVIEW/VIEW_MODES.TRENDS
- Dashboard 4-tab system not documented in README

**docs/product-context.md**:
- Line 72: States "4 default income sources" (matches defaultData.ts)
- Dashboard description doesn't mention 4-tab system (Overview, Month, Year, Trends)
- Cash register input feature (lines 102-106) not mentioned in product overview

**docs/technical-context.md**:
- Line 59: Lists "InstallmentHandler.tsx" component that doesn't exist

#### 2.2 Console.error in Production
- **File**: `src/components/common/ErrorBoundary.tsx:47`
- **Fix**: Add environment check: `if (import.meta.env.DEV) console.error(...)`

#### 2.3 Incomplete Error Handling
- **File**: `src/components/layout/Navbar.tsx:19`
- **Issue**: Generic alert doesn't show specific error message
- **Fix**: Display `error.message` to user

#### 2.4 Inconsistent Alert/Confirm Usage (8 files)
- Uses blocking window.alert() and window.confirm()
- **Files to update**:
  - Navbar.tsx
  - TransactionForm.tsx
  - TransactionList.tsx
  - CategoryManager.tsx
  - SourceManager.tsx
  - useBackup.ts
  - DatabaseReset.tsx
- **Fix**: Create reusable ConfirmModal and AlertModal components

#### 2.5 Missing Empty States
- **BudgetEditor.tsx**: No guidance when no categories exist
- **Dashboard tabs**: No empty state for Overview and Trends tabs
- **Note**: TransactionList.tsx has good empty state (line 127) - use as reference

#### 2.6 Missing Error States
- No error boundary around individual pages
- Database errors in AppContext (line 102) logged but not shown to user
- Export/Import failures show alerts instead of proper error UI

#### 2.7 Poor Mobile Responsiveness
- **TransactionList.tsx:42**: Wide table with no horizontal scroll or responsive layout
- **BudgetEditor.tsx**: Complex nested inputs don't adapt to mobile (600+ lines)
- **Dashboard tabs**: No mobile optimization
- **Fix**: Create responsive card layouts for mobile, stack inputs vertically

#### 2.8 Accessibility Issues
- **Buttons missing aria-label**: Modal close button (Modal.tsx:57), delete buttons throughout
- **Modal**: Missing aria-modal and role="dialog" attributes
- **No focus management**: Modal doesn't trap focus or return focus on close
- **TabNavigation** (src/components/dashboard/TabNavigation.tsx): Doesn't use proper ARIA tab pattern
- **Form validation**: Errors not announced to screen readers (no aria-live regions)
- **Only 14 aria attributes** in entire codebase

#### 2.9 Form Validation Issues
- **TransactionForm.tsx**: Lines 50, 55, 59, 64 use alert() for validation errors
- **Fix**: Replace with inline error messages below form fields
- **BudgetEditor.tsx**: No validation for negative values
- No visual indication of required fields before submission

#### 2.10 Missing Memoization
- **TransactionList.tsx**: getCategoryName (line 16) and getSourceName (line 28) recreated on every render
- **Fix**: Use useCallback to memoize these functions

#### 2.11 Expensive Re-renders
- **BudgetEditor.tsx** (640 lines): Re-renders on every keystroke
- Lines 24-93: useEffect with large dependency array causes frequent recalculations
- **Fix**: Split into smaller components (IncomeSection, ExpenseSection, CategoryRow)

#### 2.12 No Virtualization
- **TransactionList.tsx**: Renders all transactions without pagination
- **YearlyCategoryTrends.tsx**: Renders all categories expanded
- **Fix**: Implement react-window for lists with 100+ items

#### 2.13 Budget Mode Inconsistency
- Legacy `isRecurrent` field (Budget type line 39) still supported but deprecated
- Some budgets have `mode: 'recurring'`, others have `isRecurrent: true`
- Migration path not documented

#### 2.14 Yearly View Calculation Gaps
- **File**: `src/hooks/useYearlyCalculations.ts:71-74`
- Skips empty months, creating gaps in monthly breakdown
- Breaks chart displays
- **Fix**: Always return 12 months, even if empty

#### 2.15 Missing Loading States
- useBackup hook tracks isExporting/isImporting but doesn't show spinner in UI
- AppContext has isLoading but not used consistently

#### 2.16 Missing Keyboard Navigation
- BudgetEditor cash register input: No Enter/Tab support
- CategoryManager expandable sections: No keyboard support
- Modal closes on Escape (good!) but doesn't trap Tab key

---

### 3. MINOR ISSUES (12)

#### 3.1 Unused Parameters
- GroupBreakdown.tsx line 105: Receives both `summaries` and `summariesWithSubcategories`, only uses latter
- Multiple components have unused props

#### 3.2 Magic Numbers
- BudgetEditor.tsx lines 107-109: Hardcoded currency formatting
- useTrendCalculations.ts line 187: Hardcoded 10% threshold
- useTrendCalculations.ts line 216: Hardcoded adherence score (50-100 scale)
- **Fix**: Extract to constants file

#### 3.3 Incomplete TODOs
- ErrorBoundary.tsx line 54: "TODO: Send error to logging service"
- logger.ts line 39: "TODO: Implement integration with logging service"

#### 3.4 No Bundle Size Analysis
- No script in package.json for bundle analysis
- Recharts is large (~400KB) and imported in 5+ files
- **Fix**: Add bundle analysis script, implement dynamic imports for charts

#### 3.5 Database Query Optimization
- AppContext loads all data on mount (lines 93-97) even if not needed
- BudgetEditor queries budgets array multiple times (lines 31-93)
- Should use Dexie compound indexes

#### 3.6 Transaction Installment Identification
- No way to identify related installment transactions
- No parent transaction ID linking installments together

#### 3.7 No Data Sanitization
- importData validates structure but not content
- Malicious JSON could include XSS payloads
- **Fix**: Sanitize all string fields after import

#### 3.8-3.12 Other Minor Issues
- Documentation folder structure mismatch
- XSS protection not comprehensive
- Missing timezone handling tests
- Legacy code comments
- Inconsistent code formatting

---

## EXECUTION PLAN (42 Tasks)

### Phase 1: Critical Fixes (Build & Tests)
**Priority**: Must complete first - blocks everything else

1. **Fix TypeScript build failure**
   - File: `tsconfig.json`
   - Action: Add `"types": ["vitest/globals"]` to compilerOptions

2. **Fix monthNumberToDate bug**
   - File: `src/utils/date.ts:74-78`
   - Action: Change `Math.floor(monthNum / 12)` to `Math.floor((monthNum - 1) / 12)`

3. **Fix useTrendCalculations test failures**
   - File: `src/hooks/useTrendCalculations.ts:71-87`
   - Action: Don't filter out empty months, return all months in range

4. **Fix useYearlyCalculations test failures**
   - File: `src/hooks/useYearlyCalculations.ts:71-74`
   - Action: Always return 12 months, include empty months

5. **Remove console.error from production**
   - File: `src/components/common/ErrorBoundary.tsx:47`
   - Action: Add `if (import.meta.env.DEV)` check

6. **Improve Navbar error handling**
   - File: `src/components/layout/Navbar.tsx:19`
   - Action: Show specific error message in alert or modal

### Phase 2: Code Quality (4 tasks)

7. **Create constants file**
   - File: `src/constants/formatting.ts` (new)
   - Action: Extract magic numbers for currency, thresholds, etc.

8. **Remove unused parameters**
   - Files: Multiple components
   - Action: Remove or use unused props, fix TypeScript warnings

9. **Add data sanitization**
   - File: `src/utils/exportImport.ts`
   - Action: Sanitize all string fields on import using DOMPurify

10. **Update documentation**
    - Files: README.md, docs/product-context.md, docs/technical-context.md
    - Action: Update to match current implementation (4-tab dashboard, view modes, etc.)

### Phase 3: UX Improvements (6 tasks)

11. **Create ConfirmModal component**
    - File: `src/components/common/ConfirmModal.tsx` (new)
    - Action: Reusable confirmation dialog with title, message, confirm/cancel buttons

12. **Create AlertModal component**
    - File: `src/components/common/AlertModal.tsx` (new)
    - Action: Reusable alert dialog with title, message, OK button

13. **Replace all window.alert/confirm calls**
    - Files: 8 files (Navbar, TransactionForm, TransactionList, CategoryManager, SourceManager, useBackup, DatabaseReset)
    - Action: Replace with ConfirmModal/AlertModal components

14. **Add loading states**
    - File: `src/components/layout/Navbar.tsx`
    - Action: Show spinner during import/export operations

15. **Add empty states**
    - Files: BudgetEditor.tsx, Dashboard Overview tab, Dashboard Trends tab
    - Action: Show helpful messages when no data exists

16. **Add inline form validation**
    - File: `src/components/transactions/TransactionForm.tsx`
    - Action: Replace alerts with inline error messages, add field-level validation

### Phase 4: Accessibility (6 tasks)

17. **Add ARIA labels to buttons**
    - Files: Modal.tsx, delete buttons throughout app
    - Action: Add aria-label to all icon buttons and interactive elements

18. **Implement Modal focus management**
    - File: `src/components/common/Modal.tsx`
    - Action: Trap focus, return focus on close, add aria-modal and role="dialog"

19. **Fix TabNavigation ARIA pattern**
    - File: `src/components/dashboard/TabNavigation.tsx`
    - Action: Use proper role="tablist", role="tab", role="tabpanel", aria-selected

20. **Add aria-live regions**
    - Files: TransactionForm, BudgetEditor, any forms with validation
    - Action: Announce validation errors to screen readers

21. **Add keyboard navigation to expandable sections**
    - Files: CategoryManager, BudgetEditor expandable rows
    - Action: Support Enter/Space to expand/collapse, arrow keys to navigate

22. **Comprehensive keyboard support**
    - Files: Throughout app (Modal, forms, lists)
    - Action: Ensure Enter/Tab/Escape work correctly, test with keyboard only

### Phase 5: Mobile Responsiveness (4 tasks)

23. **Make TransactionList responsive**
    - File: `src/components/transactions/TransactionList.tsx`
    - Action: Switch to card layout on mobile (<768px), stack information vertically

24. **Optimize BudgetEditor for mobile**
    - File: `src/components/budget/BudgetEditor.tsx`
    - Action: Stack inputs vertically, increase touch targets, simplify layout

25. **Make Dashboard tabs mobile-friendly**
    - Files: Dashboard page, TabNavigation
    - Action: Make tabs scrollable, add swipe gestures, optimize charts for small screens

26. **Add responsive breakpoints**
    - Files: All major layouts (Navbar, pages, cards)
    - Action: Test and adjust layouts for mobile (320px), tablet (768px), desktop (1024px+)

### Phase 6: Performance (6 tasks)

27. **Memoize TransactionList callbacks**
    - File: `src/components/transactions/TransactionList.tsx:16,28`
    - Action: Wrap getCategoryName and getSourceName in useCallback

28. **Split BudgetEditor into smaller components**
    - File: `src/components/budget/BudgetEditor.tsx`
    - Action: Extract IncomeSection, ExpenseSection, CategoryRow components

29. **Add virtualization to TransactionList**
    - File: `src/components/transactions/TransactionList.tsx`
    - Action: Install react-window, implement virtual scrolling for 1000+ items

30. **Add virtualization to YearlyCategoryTrends**
    - File: `src/components/dashboard/YearlyCategoryTrends.tsx`
    - Action: Implement virtual scrolling for category list

31. **Implement dynamic imports for charts**
    - Files: All files importing Recharts
    - Action: Use React.lazy() to load charts on demand

32. **Optimize database queries**
    - File: `src/context/AppContext.tsx:93-97`
    - Action: Lazy load data, add compound indexes to Dexie

### Phase 7: Testing (6 tasks)

33. **Add TransactionForm component tests**
    - File: `src/components/transactions/__tests__/TransactionForm.test.tsx` (new)
    - Test: Validation, installments creation, form submission, category/source selection

34. **Add BudgetEditor component tests**
    - File: `src/components/budget/__tests__/BudgetEditor.test.tsx` (new)
    - Test: CRUD operations, recurrent budgets, category expansion, calculations

35. **Add CategoryManager component tests**
    - File: `src/components/setup/__tests__/CategoryManager.test.tsx` (new)
    - Test: Expand/collapse, add/edit/delete categories, subcategory management

36. **Add Modal component tests**
    - File: `src/components/common/__tests__/Modal.test.tsx` (new)
    - Test: Keyboard (Escape), focus management, accessibility attributes

37. **Add ErrorBoundary tests**
    - File: `src/components/common/__tests__/ErrorBoundary.test.tsx` (new)
    - Test: Error catching, fallback UI, reset functionality

38. **Add integration tests**
    - Files: `src/__tests__/integration/*.test.tsx` (new)
    - Test: Complete user flows (add transaction → view dashboard, create budget → add expenses)

### Phase 8: Final Polish (4 tasks)

39. **Add bundle size analysis**
    - File: `package.json`
    - Action: Add script for bundle analysis (e.g., `npm run analyze`)

40. **Remove legacy budget mode field**
    - Files: Budget type definition, all components using isRecurrent
    - Action: Migrate all budgets to use mode field, remove isRecurrent support

41. **Add parent transaction ID to installments**
    - Files: Transaction type, TransactionForm, transaction creation logic
    - Action: Link installment transactions with parent ID for tracking

42. **Verify yearly view returns 12 months**
    - File: `src/hooks/useYearlyCalculations.ts`
    - Action: Ensure all months present even if empty (fixes chart gaps)

---

## EXECUTION NOTES

### Files to Create (New)
1. `src/constants/formatting.ts` - Currency, thresholds, etc.
2. `src/components/common/ConfirmModal.tsx` - Confirmation dialog
3. `src/components/common/AlertModal.tsx` - Alert dialog
4. `src/components/transactions/__tests__/TransactionForm.test.tsx`
5. `src/components/budget/__tests__/BudgetEditor.test.tsx`
6. `src/components/setup/__tests__/CategoryManager.test.tsx`
7. `src/components/common/__tests__/Modal.test.tsx`
8. `src/components/common/__tests__/ErrorBoundary.test.tsx`
9. `src/__tests__/integration/` - Directory for integration tests

### Files to Modify (Major Changes)
1. `tsconfig.json` - Add vitest types
2. `src/utils/date.ts` - Fix monthNumberToDate
3. `src/hooks/useTrendCalculations.ts` - Don't filter empty months
4. `src/hooks/useYearlyCalculations.ts` - Return all 12 months
5. `src/components/budget/BudgetEditor.tsx` - Split into smaller components, add mobile support
6. `src/components/transactions/TransactionList.tsx` - Responsive layout, virtualization
7. `src/components/layout/Navbar.tsx` - Replace alerts, add loading states
8. `src/components/common/Modal.tsx` - Focus management, ARIA attributes
9. `src/components/dashboard/TabNavigation.tsx` - Proper ARIA tab pattern
10. `src/components/transactions/TransactionForm.tsx` - Inline validation

### Dependencies to Install
```bash
npm install react-window @types/react-window
npm install -D @vitest/ui # Optional: Better test UI
```

### Testing Strategy
1. Fix existing tests first (Phase 1)
2. Run `npm test` after each phase to ensure no regressions
3. Add component tests (Phase 7) with focus on user interactions
4. Add integration tests last to verify complete flows

### Mobile Testing
- Test on Chrome DevTools device emulation (iPhone, iPad, Android)
- Key breakpoints: 320px (mobile), 768px (tablet), 1024px+ (desktop)
- Test touch interactions (tap targets min 44px)

### Accessibility Testing
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA on Windows, VoiceOver on Mac)
- Run axe DevTools or Lighthouse accessibility audit
- Verify color contrast meets WCAG AA standards

---

## SUCCESS CRITERIA

### Build & Tests
- [ ] `npm run build` completes without errors
- [ ] `npm run typecheck` passes with no errors
- [ ] All existing tests pass (0 failures)
- [ ] New component tests added and passing
- [ ] Integration tests cover critical flows

### UX
- [ ] No window.alert/confirm in codebase
- [ ] All forms have inline validation with error messages
- [ ] Loading states visible during async operations
- [ ] Empty states show helpful guidance
- [ ] Error states display actionable error messages

### Accessibility
- [ ] All interactive elements have ARIA labels
- [ ] Modal traps focus and returns focus on close
- [ ] Tabs use proper ARIA tab pattern
- [ ] Form errors announced to screen readers
- [ ] Keyboard navigation works throughout app
- [ ] Color contrast meets WCAG AA

### Mobile
- [ ] App usable on 320px viewport
- [ ] Tables convert to cards on mobile
- [ ] Forms stack vertically with adequate spacing
- [ ] Touch targets minimum 44px
- [ ] No horizontal scrolling required

### Performance
- [ ] No unnecessary re-renders in React DevTools Profiler
- [ ] Large lists use virtualization
- [ ] Charts load on demand (code splitting)
- [ ] Bundle size analyzed and optimized

### Documentation
- [ ] README matches current features
- [ ] product-context.md reflects 4-tab dashboard
- [ ] technical-context.md accurate for component structure
- [ ] CHANGELOG.md updated with changes

---

## ESTIMATED EFFORT
- **Phase 1**: 2 hours (critical path)
- **Phase 2**: 2 hours
- **Phase 3**: 3 hours
- **Phase 4**: 4 hours (most complex - accessibility)
- **Phase 5**: 3 hours
- **Phase 6**: 4 hours (performance profiling + optimization)
- **Phase 7**: 6 hours (testing is time-consuming)
- **Phase 8**: 2 hours

**Total**: ~26 hours of focused development

---

## ROLLBACK PLAN
- Commit after each phase completes
- Tag stable commits: `git tag phase-1-complete`
- If issues arise, rollback: `git reset --hard phase-X-complete`

---

## PHASE DEPENDENCIES
- **Phase 1** must complete first (blocks all testing)
- **Phase 2** can run parallel to Phase 3
- **Phase 3** should complete before Phase 4 (modals needed for accessibility)
- **Phase 4-6** can partially overlap
- **Phase 7** requires all components stable
- **Phase 8** is final polish after everything works

---

**Ready to execute**: Start with Phase 1, verify build success, then proceed sequentially through remaining phases.
