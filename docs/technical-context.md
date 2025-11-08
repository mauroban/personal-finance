# 🧭 Technical Context — Simple Budget Tracker

*(Local-First Web App, Tauri-Ready)*

---

## 🎯 Goal

Build a **local-first, privacy-preserving**, and **delightfully simple** budgeting web app that lets users define categories, create budgets, log transactions, and compare their financial progress — entirely offline.

---

## 🧱 1. Architecture Overview

| Layer                  | Technology                     | Description                               |
| ---------------------- | ------------------------------ | ----------------------------------------- |
| **Frontend Framework** | React (with TypeScript)        | Declarative UI for component-based design |
| **Styling**            | Tailwind CSS                   | Modern utility-first design system        |
| **Local Database**     | IndexedDB via Dexie.js         | Persistent, offline-first data layer      |
| **State Management**   | React Context + Hooks          | Local state and global synchronization    |
| **Build & Tooling**    | Vite                           | Fast dev server, zero-config bundling     |
| **Export/Import**      | Browser File APIs              | JSON backup and restore                   |
| **Testing**            | Vitest + React Testing Library | Lightweight and modern testing stack      |

---

## ⚙️ 2. Project Setup

```bash
npm create vite@latest simple-budget-tracker -- --template react-ts
cd simple-budget-tracker

npm install dexie tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Add Tailwind imports to index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

# Optional (recommended)
npm install eslint prettier -D

npm run dev
```

---

## 🧩 3. Folder Structure

```
src/
├── components/
│   ├── setup/
│   │   ├── CategoryManager.tsx
│   │   ├── SourceManager.tsx
│   │   └── DatabaseReset.tsx         # Reset database tool
│   ├── budget/
│   │   ├── BudgetEditor.tsx          # Supports subcategories & recurrent budgets
│   │   └── YearlyBudgetOverview.tsx  # Annual budget grid view
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── InstallmentHandler.tsx
│   ├── dashboard/
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx       # Financial health overview
│   │   │   ├── MonthTab.tsx          # Monthly detailed view
│   │   │   ├── YearTab.tsx           # Annual analysis
│   │   │   └── TrendsTab.tsx         # Trend analysis
│   │   ├── TabNavigation.tsx         # 4-tab switcher
│   │   ├── MonthlyHealthHero.tsx     # Status indicator
│   │   ├── PerformanceHeatmap.tsx    # Calendar heatmap
│   │   ├── AlertBanner.tsx           # Warnings/alerts
│   │   ├── TopTransactions.tsx       # Recent activity
│   │   ├── SpendingInsights.tsx      # Pattern analysis
│   │   ├── YearlySummary.tsx         # Annual overview card
│   │   ├── MonthlyBreakdownTable.tsx # 12-month table
│   │   ├── YearlyCategoryTrends.tsx  # Category performance
│   │   ├── CategoryTrendChart.tsx    # Trend visualization
│   │   ├── CategoryImpactAnalysis.tsx# Variance analysis
│   │   ├── MonthlyTrendChart.tsx     # Time series chart
│   │   ├── VarianceAreaChart.tsx     # Budget variance
│   │   ├── CategoryPieChart.tsx      # Distribution chart
│   │   ├── SummaryCard.tsx           # Metric cards
│   │   ├── GroupBreakdown.tsx        # Category breakdown
│   │   ├── IncomeExpenseChart.tsx    # Income vs expense
│   │   ├── MetricCard.tsx            # Reusable metric display
│   │   ├── TrendSparkline.tsx        # Mini trend indicators
│   │   ├── HeroCard.tsx              # Large status cards
│   │   ├── CategoryProgressRow.tsx   # Category progress
│   │   └── InsightsList.tsx          # Insights component
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── PeriodSelector.tsx        # Year/month selector
│   │   ├── LoadingState.tsx          # Loading indicator
│   │   └── EmptyState.tsx            # Empty state display
│   └── layout/
│       ├── Navbar.tsx
│       └── PageContainer.tsx
│
├── context/
│   ├── AppContext.tsx
│   └── useTransactions.ts
│
├── db/
│   └── index.ts
│
├── hooks/
│   ├── useIndexedDB.ts
│   ├── useBackup.ts
│   └── useBudgetCalculations.ts
│
├── pages/
│   ├── SetupPage.tsx
│   ├── BudgetPage.tsx
│   ├── TransactionsPage.tsx
│   └── DashboardPage.tsx
│
├── utils/
│   ├── date.ts
│   ├── format.ts
│   ├── exportImport.ts
│   ├── id.ts
│   ├── defaultData.ts           # Brazilian default categories
│   ├── initializeDefaults.ts    # First-load initialization
│   ├── copyRecurrentBudgets.ts  # Auto-copy recurrent budgets to future months
│   └── resetDatabase.ts         # Clear and reinitialize database
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🎨 4. UI/UX Guidelines

### Design Principles

1. **Clarity first** — each screen should answer one question:

   * Setup → “How do I organize my money?”
   * Budget → “What do I plan to spend/earn?”
   * Transactions → “What have I done?”
   * Dashboard → “How am I doing?”
2. **Minimal UI** — no clutter, consistent spacing, clean typography.
3. **Zero friction** — users should be able to:

   * Add a transaction in <10 seconds.
   * Navigate between views instantly.
4. **Responsive Design** — mobile and desktop friendly (Tailwind makes this easy).

---

## 🧭 5. Core Screens and Components

### 🏗 5.1 Setup Page (`SetupPage.tsx`)

**Goal:** First-time setup of groups, subgroups, and earning sources.

**Components:**

* `CategoryManager` → Manage expense groups & subgroups.
* `SourceManager` → Manage earning sources.
* `DatabaseReset` → Reset database to defaults (danger zone).
* Reusable `Input`, `Button`, `Modal`.

**UX Flow:**

1. User defines groups (e.g., "Home", "Leisure").
2. For each, optional subgroups.
3. Defines income sources (e.g., "Salary", "Freelance").
4. All saved immediately to IndexedDB.
5. Can reset database if needed (with double confirmation).

---

### 💰 5.2 Budget Page (`BudgetPage.tsx`)

**Goal:** Define monthly planned budgets for expenses and forecasted incomes.

**Components:**

* `BudgetEditor` → Inline editable table.
* `BudgetSummary` → Displays totals for validation.

**UX Flow:**

* Select Year → Month → Set values per group/source.
* Inline editing (no modals).
* Auto-save to IndexedDB.

---

### 🧾 5.3 Transactions Page (`TransactionsPage.tsx`)

**Goal:** Quick, frictionless transaction logging.

**Components:**

* `TransactionForm` → "Quick Add" form with 2 transaction modes (Único, Parcelado).
* `TransactionList` → Displays recent logs.

**Transaction Modes:**

1. **Único** (Single) → One-time transaction
2. **Parcelado** (Installments) → Divides value across N months

*Note: Recurring transactions were removed as they don't make logical sense for actual transactions (which are historical events).*

**UX Flow:**

1. Choose "Earning" or "Expense".
2. Select transaction mode (Único/Parcelado).
3. Fill value → date (default: today).
4. Select group/source.
5. If Parcelado → specify number of months/installments.
6. For installments, transactions are auto-created for future months with divided values.

---

### 📊 5.4 Dashboard Page (`DashboardPage.tsx`)

**Goal:** Provide comprehensive financial insights through a multi-perspective dashboard.

**Architecture:** 4-tab navigation system with lazy loading

**Tab Structure:**

1. **Overview Tab** (`OverviewTab.tsx`)
   - Monthly Health Hero - Current financial status indicator
   - Alert Banner - Budget warnings and notifications
   - Performance Heatmap - Calendar-based spending visualization
   - Top Transactions - Recent activity summary
   - Spending Insights - Pattern analysis

2. **Month Tab** (`MonthTab.tsx`)
   - Detailed monthly analysis
   - Income vs budget comparison
   - Category breakdown with progress bars
   - Income/Expense Chart

3. **Year Tab** (`YearTab.tsx`)
   - Annual summary with variance analysis
   - Monthly breakdown table (all 12 months)
   - Category trends over the year
   - Drill-down to specific months

4. **Trends Tab** (`TrendsTab.tsx`)
   - Monthly trend charts
   - Category trend analysis
   - Variance area charts
   - Category impact analysis
   - Expense distribution (pie chart)

**Key Components:**

* `TabNavigation` → Switches between 4 views
* `PeriodSelector` → Year/month selection (shown for Month and Year tabs)
* `MonthlyHealthHero` → At-a-glance status indicator
* `PerformanceHeatmap` → Calendar heatmap of spending
* `YearlySummary` → Annual overview card
* `MonthlyBreakdownTable` → 12-month comparison table
* `CategoryTrendChart` → Spending trends by category
* `CategoryImpactAnalysis` → Which categories drive variance
* And 15+ specialized visualization components

**Lazy Loading Pattern:**

```tsx
// Tabs are lazy loaded for performance
const OverviewTab = lazy(() => import('@/components/dashboard/tabs/OverviewTab')...)
const MonthTab = lazy(() => import('@/components/dashboard/tabs/MonthTab')...)
const YearTab = lazy(() => import('@/components/dashboard/tabs/YearTab')...)
const TrendsTab = lazy(() => import('@/components/dashboard/tabs/TrendsTab')...)

// Rendered with Suspense boundary
<Suspense fallback={<LoadingState />}>
  {currentTab === VIEW_MODES.OVERVIEW && <OverviewTab {...props} />}
  {/* ... other tabs */}
</Suspense>
```

**Benefits:**
- Faster initial page load (only loads active tab)
- Reduced bundle size per route
- Better code splitting
- Improved performance on slower devices

**UX Flow:**

* Default to Overview tab
* Period selector shows only for Month and Year tabs
* View preference persisted in localStorage
* Drill-down: clicking month in Year tab switches to Month tab for that month

---

## 🎨 5.2.1 Budget Features

### Subcategory Budgeting

The budget editor enforces subcategory-level budgeting:
- Click ▶ to expand categories and see subcategories
- **Main categories are read-only** - they only display totals
- **Budgets must be set at subcategory level only**
- Category totals automatically sum all subcategory budgets
- Clear visual hierarchy shows relationship between categories

### Budget Modes

Every budget (income or expense) has one of three modes:

1. **Único** (Unique) - Default mode
   - Budget applies only to the current month
   - Does not copy to future months
   - Best for one-time planned expenses or irregular income

2. **🔄 Recorrente** (Recurring)
   - Budget automatically copies to **ALL** future months
   - Works even when skipping months (e.g., Jan → Mar copies budgets)
   - Uses most recent values for each category/source
   - Perfect for: rent, subscriptions, salaries, utilities
   - Continues indefinitely until manually changed

3. **📋 Parcelado** (Installments)
   - Budget copies for a specific number of months (e.g., 12 months)
   - Specify how many months the installment will last
   - Useful for: planned installment purchases, temporary recurring expenses
   - Automatically stops after the specified period

**UI Features:**
- **Dropdown select** for mode selection (Único, Recorrente, Parcelado)
- Installment count input appears inline when Parcelado is selected
- **Delete button (✕)** always visible for entries with values (not hover-only)
- Delete button positioned next to mode dropdown for easy access
- **Cash register style input**: Type digits to add cents (e.g., type "1234" → "R$ 12,34")
  - First 2 digits go into cents
  - Backspace removes last digit
  - Always displays in Brazilian currency format (R$ X,XX)
  - Empty fields show light gray placeholder "R$ 0,00"
  - Saves to database only on blur (no lag while typing)

**Delete Functionality:**
When deleting a recurring or installment budget:
1. **All past months** (including skipped/unvisited months):
   - Existing budgets are converted to "unique" mode
   - Missing months are created retroactively as "unique" budgets
   - This preserves historical data
2. **Current month and all future months**:
   - Deleted completely
   - Will not be auto-created when visiting future months

Example: Recurring budget from Jan, deleted in May (only visited Jan, Mar, May)
- Result: Jan, Feb (created), Mar, Apr (created) all become "unique"
- May and all future months are deleted

**Logic:**
When opening a new month, the system:
1. Finds all recurring and installment budgets from previous months
2. For recurring budgets: copies to current month indefinitely
3. For installment budgets: copies only if within the installment period
4. For each category/source, uses the most recent budget values

### Implementation Details

```tsx
// Recurring budget for subcategory (e.g., monthly rent)
{
  groupId: 1,        // "Moradia"
  subgroupId: 2,     // "Aluguel"
  amount: 1500,
  mode: 'recurring'
}

// Unique budget for subcategory (one-time expense)
{
  groupId: 1,        // "Moradia"
  subgroupId: 3,     // "Manutenção"
  amount: 500,
  mode: 'unique'
}

// Installment budget for income source (e.g., 12-month bonus payment)
{
  sourceId: 1,       // "Salário"
  amount: 36000,     // Total amount (displayed as 3000/month for 12 months)
  mode: 'installment',
  installments: 12,
  installmentNumber: 3  // This is month 3 of 12
}
```

**Note**: Main categories (groupId without subgroupId) cannot have budget values. All expense budgets must specify a subgroupId.

---

## 🧠 6. State Management Strategy

### Global State: `AppContext`

Holds:

```ts
{
  categories: Category[];
  sources: Source[];
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  viewMode: string; // See VIEW_MODES below
}
```

### View Modes: `VIEW_MODES` Constants

The app uses different view modes for different pages:

```ts
// constants/viewModes.ts
export const VIEW_MODES = {
  // Dashboard tabs (4 tabs)
  OVERVIEW: 'overview',  // Financial health overview
  MONTH: 'month',        // Monthly detailed analysis
  YEAR: 'year',          // Annual overview
  TRENDS: 'trends',      // Trend analysis

  // Budget page views (2 views)
  MONTHLY: 'monthly',    // Monthly budget editor
  YEARLY: 'yearly',      // Yearly budget grid

  // Legacy support (backward compatibility)
  // Old versions used 'monthly'/'yearly' for dashboard
  // New code maps these to MONTH/YEAR automatically
}
```

**Usage:**
- **Dashboard:** Uses OVERVIEW, MONTH, YEAR, TRENDS (4-tab system)
- **Budget:** Uses MONTHLY, YEARLY (2-view toggle)
- View preference persisted in localStorage per page

### Hooks

| Hook                    | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `useTransactions`       | Add/edit/delete transactions, handle installments |
| `useBudgetCalculations` | Compute totals, remaining budgets                 |
| `useBackup`             | Handle export/import logic                        |
| `useIndexedDB`          | Generic async operations with Dexie               |

All hooks interact with Dexie and dispatch updates to `AppContext`.

---

## 💾 7. Data Model Reference

**Database Version:** 2 (with optimized indexes)

```ts
type Category = {
  id?: number;
  name: string;
  parentId?: number; // null for main categories, ID for subcategories
};

type Source = {
  id?: number;
  name: string;
};

type Transaction = {
  id?: number;
  type: 'earning' | 'expense';
  value: number;
  date: string; // ISO format
  groupId: number;
  subgroupId?: number;
  method?: string; // Payment method for expenses
  installments?: number; // Number of installments (for display)
  note?: string; // Optional description
};

type Budget = {
  id?: number;
  year: number;
  month: number; // 1-12
  type: 'income' | 'expense';
  sourceId?: number; // For income budgets
  groupId?: number; // For expense budgets (main category)
  subgroupId?: number; // For expense budgets (subcategory)
  amount: number;
  mode?: 'unique' | 'recurring' | 'installment'; // Budget mode
  installments?: number; // Total installments (for installment mode)
  installmentNumber?: number; // Current installment number
  // Legacy support (auto-migrated)
  isRecurrent?: boolean; // Deprecated, replaced by mode: 'recurring'
};
```

**Database Schema (Dexie):**

```ts
// Schema version 2
db.version(2).stores({
  categories: '++id, name, parentId',
  sources: '++id, name',
  transactions: '++id, type, date, groupId, subgroupId',
  budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month]'
});
```

**Key Indexes:**
- `[year+month]` compound index for efficient budget queries
- `mode` index for filtering recurring/installment budgets
- Optimized for common queries (get budgets for specific month, find recurring budgets)

---

## 💾 8. Data Durability & Backup

| Action              | Behavior                                                           |
| ------------------- | ------------------------------------------------------------------ |
| **Auto-save**       | All edits trigger async IndexedDB writes                           |
| **Export Backup**   | Aggregates all tables → single JSON download                       |
| **Import Backup**   | Replaces all IndexedDB tables with uploaded data                   |
| **Reset Database**  | Clears all data and reinitializes with Brazilian defaults (Setup) |

**Database Reset Tool:**
- Located in Setup page under "Zona de Perigo" (Danger Zone)
- Requires double confirmation to prevent accidental data loss
- Clears: transactions, budgets, categories, sources
- Automatically reinitializes with Brazilian default categories and sources
- Useful for fixing data corruption or starting fresh

Example export:

```ts
{
  version: 1,
  categories: [...],
  sources: [...],
  budgets: [...],
  transactions: [...]
}
```

---

## 🧮 9. Calculations

### Monthly Summary Logic:

```ts
totalIncome = sum(transactions.filter(t => t.type === 'earning'))
totalExpense = sum(transactions.filter(t => t.type === 'expense'))
netBalance = totalIncome - totalExpense
```

### Progress Per Category:

```ts
spent = sum(expenses for group)
planned = budget for group
progress = (spent / planned) * 100
```

Handle missing budgets gracefully (avoid dividing by zero).

---

## 🧰 10. Best Practices

### Code

* Use **functional components** + hooks only (no classes).
* Use **TypeScript interfaces** for all props.
* Keep components **pure and focused**.
* Avoid direct Dexie access inside components — use hooks.
* Use **lazy loading** for large components or tabs (see Dashboard pattern).
* Memoize expensive calculations with `useMemo`.
* Memoize callbacks passed to child components with `useCallback`.

### Performance Optimization

* **Code Splitting:**
  ```tsx
  // Lazy load large components
  const HeavyComponent = lazy(() => import('./HeavyComponent'))

  // Always wrap with Suspense
  <Suspense fallback={<LoadingState />}>
    <HeavyComponent />
  </Suspense>
  ```

* **Component Memoization:**
  ```tsx
  // Prevent unnecessary re-renders
  export const ExpensiveComponent = React.memo(({ data }) => {
    // Component logic
  })
  ```

* **Database Optimization:**
  - Use compound indexes for common queries: `[year+month]`
  - Use `bulkDelete` for multiple deletions
  - Query only needed fields when possible

### UI

* Use consistent Tailwind spacing (e.g., `p-4`, `m-4`, `rounded-xl`).
* Prefer **modals** for editing, **inline forms** for adding.
* Use color for **context only** (green = income, red = expense).
* Always provide **loading states** for async operations.
* Include **empty states** for lists/tables with no data.

### Storage

* Always handle `await` on Dexie operations.
* Validate user input before saving.
* Version IndexedDB schema when extending data models.
* Use transactions for multiple related operations.
* Handle migration logic in version upgrade callbacks.

---

## 🧪 11. Testing Guidelines

**Framework:** Vitest + React Testing Library

**CRITICAL PRINCIPLE: ALWAYS TEST BEHAVIOR, NOT IMPLEMENTATION**

Tests should verify **what** the code does (user-visible behavior), not **how** it does it (internal implementation).

### Testing Philosophy:

✅ **DO:**
- Test user interactions and outcomes
- Test what users see and experience
- Test data transformations and calculations
- Use accessible queries (getByRole, getByLabelText)
- Focus on component contracts and APIs

❌ **DON'T:**
- Test internal state variables
- Test private functions directly
- Test implementation details (class names, data structures)
- Rely on component internals or DOM structure
- Mock everything (mock only external dependencies)

| Type                  | Description              | Example                 |
| --------------------- | ------------------------ | ----------------------- |
| **Unit Tests**        | Utility & hook logic     | `useBudgetCalculations` |
| **Integration Tests** | Components + context     | `TransactionForm`       |
| **Smoke Tests**       | Page-level render checks | `DashboardPage`         |

### Example - Good Behavior Test:

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from '@/components/transactions/TransactionForm';

test('user can add a new expense transaction', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  render(<TransactionForm isOpen={true} onClose={onClose} />);

  // User fills the form
  await user.type(screen.getByLabelText(/valor/i), '100');
  await user.selectOptions(screen.getByLabelText(/categoria/i), 'Alimentação');

  // User submits
  await user.click(screen.getByRole('button', { name: /adicionar/i }));

  // Verify the outcome
  expect(onClose).toHaveBeenCalled();
});
```

### Example - Bad Implementation Test:

```ts
// ❌ DON'T DO THIS - tests implementation details
test('sets internal state when value changes', () => {
  const { container } = render(<TransactionForm />);
  const component = container.firstChild;
  expect(component.state.value).toBe(''); // Testing internal state!
});
```

---

## 🧩 12. Build, Distribution & Migration

### Build for Web:

```bash
npm run build
```

Outputs static files in `dist/`:

```
dist/
├── index.html
├── assets/
└── ...
```

### Run Locally:

```bash
npm run preview
```

### Future Migration to Desktop (Tauri):

```bash
npm install @tauri-apps/cli @tauri-apps/api
npx tauri init
npm run tauri build
```

Same UI, now as a `.exe` or `.app` file.

---

## ✅ 13. Summary Table

| Layer   | Tool              | Role                     | Key Benefit          |
| ------- | ----------------- | ------------------------ | -------------------- |
| UI      | React + Tailwind  | Component system         | Clean, modern look   |
| Logic   | TypeScript        | Type-safe                | Fewer runtime errors |
| Data    | Dexie (IndexedDB) | Local-first              | Private, persistent  |
| State   | React Context     | Lightweight global state | Simple, predictable  |
| Build   | Vite              | Fast dev + bundle        | Tauri-ready          |
| Export  | File API          | Backup/restore           | Full data control    |
| Testing | Vitest + RTL      | QA                       | Maintain reliability |

---

Would you like me to continue this with a **UI component wireframe plan** (showing what each main screen looks like and how components fit visually)?
That’s the next step before actual implementation — it ensures dev + designer alignment.
