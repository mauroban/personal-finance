# Dashboard Redesign Plan

## 1. Overview & Goals

### Current State
The dashboard has two main views (Monthly and Yearly) with various components showing income, expenses, budgets, and category breakdowns. While functional, the interface could be more organized, cleaner, and provide better insights into financial performance.

### Goals
Transform the dashboard into a **modern, clean, and highly informative financial command center** that:
- Provides instant clarity on budget performance
- Shows trends and patterns across time periods (Monthly, Yearly, YTD)
- Enables easy comparison between planned vs. actual
- Highlights savings progress and adherence to financial goals
- Uses whitespace effectively while maximizing information density
- Provides multiple focused views instead of overwhelming single pages

### Success Criteria
- Users can answer "How am I doing financially?" within 5 seconds
- Clear visual hierarchy guides attention to most important metrics
- Beautiful, modern design that feels premium and trustworthy
- Responsive design works perfectly on mobile and desktop
- Interactive elements provide deeper insights on demand

---

## 2. New Dashboard Architecture

### Multi-View Navigation System
Instead of just Monthly/Yearly toggle, implement a **tab-based navigation** with 4 main views:

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                              │
├─────────────────────────────────────────────────────────┤
│  [Overview] [Month] [Year] [Trends]                    │
│                                                         │
│  Content area specific to selected tab                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### View Breakdown

#### 1. **Overview Tab** (NEW) - Financial Health at a Glance
- **Purpose**: Instant snapshot of overall financial health
- **Key Metrics**:
  - Hero card: YTD savings vs. goal
  - Current month performance summary
  - Year progress indicator
  - Quick wins and alerts
  - Top spending categories this month
  - Recent trend (last 3 months mini-sparkline)

#### 2. **Month Tab** (Enhanced) - Deep Dive into Current/Selected Month
- **Purpose**: Detailed monthly budget execution
- **Components**:
  - Month selector (with quick jump to current)
  - Income vs. Budget card
  - Expenses vs. Budget card
  - Net Balance card
  - Category-by-category breakdown with progress bars
  - Visual charts (pie chart for expense distribution, bar chart for comparison)
  - Transaction summary (top 5 largest expenses)

#### 3. **Year Tab** (Enhanced) - Annual Performance
- **Purpose**: Yearly budget overview and monthly comparison
- **Components**:
  - Year selector
  - Annual summary cards (total income, expenses, savings, savings rate)
  - 12-month grid/heatmap showing performance
  - Monthly trend line chart (income vs. expense over 12 months)
  - Category performance table (which categories are on/off budget)
  - Best/worst months analysis

#### 4. **Trends Tab** (NEW) - Historical Analysis & Insights
- **Purpose**: Understand spending patterns and trends
- **Components**:
  - Time period selector (Last 3 months, Last 6 months, Last 12 months, Custom)
  - Category trend analysis (spending over time by category)
  - Variance analysis (how actual vs. budget has changed)
  - Seasonal patterns (if data available)
  - Savings rate trend
  - Budget adherence score over time

---

## 3. Detailed Page Specifications

### 3.1 Overview Tab

#### Layout Structure
```
┌────────────────────────────────────────────────────────┐
│  Year-to-Date Progress (Hero Section)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  YTD Savings: R$ XX,XXX / R$ YY,YYY (ZZ%)      │ │
│  │  Progress bar                                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Current Month Snapshot                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│  │ Income  │ │ Expense │ │ Balance │                 │
│  │ R$ X,XX │ │ R$ Y,YY │ │ R$ Z,ZZ │                 │
│  │ XX% ✓   │ │ YY% ⚠   │ │ +/-     │                 │
│  └─────────┘ └─────────┘ └─────────┘                 │
│                                                        │
│  Quick Insights (2-column grid)                        │
│  ┌──────────────────┐ ┌──────────────────┐           │
│  │ Top Categories   │ │ Recent Trend     │           │
│  │ • Alimentação    │ │ [Sparkline]      │           │
│  │   R$ X,XXX       │ │ Last 3 months    │           │
│  │ • Transporte     │ │ improving ↗      │           │
│  │   R$ Y,YYY       │ │                  │           │
│  └──────────────────┘ └──────────────────┘           │
│                                                        │
│  Alerts & Recommendations                              │
│  ┌────────────────────────────────────────────────┐   │
│  │ ⚠ Alimentação: 85% of budget used (15 days)  │   │
│  │ ✓ On track to save R$ X,XXX this year         │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### Key Features
- **YTD Progress Hero**: Large, prominent card showing year-to-date savings progress
- **Current Month Mini-Cards**: Compact 3-card layout with key metrics and status indicators
- **Top Categories**: Shows top 5 spending categories for current month with amounts
- **Recent Trend**: Mini sparkline chart showing last 3 months' net balance trend
- **Smart Alerts**: Contextual warnings (over budget) and encouragements (on track)
- **Quick Actions**: "View Detailed Month" button to jump to Month tab

#### Data Requirements
- YTD calculations for income, expenses, savings
- Current month summary (reuse existing `useBudgetCalculations`)
- Top N categories by spending for current month
- Last 3 months' net balance for trend
- Budget adherence checks for alerts

---

### 3.2 Month Tab (Enhanced)

#### Layout Structure
```
┌────────────────────────────────────────────────────────┐
│  Month Selector: [< Janeiro 2025 >] [Today]           │
│                                                        │
│  Performance Summary (3-column)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Receitas    │ │ Despesas    │ │ Saldo       │     │
│  │ Previsto    │ │ Previsto    │ │             │     │
│  │ R$ X,XXX    │ │ R$ Y,YYY    │ │ R$ Z,ZZZ    │     │
│  │ Realizado   │ │ Realizado   │ │             │     │
│  │ R$ XX,XX    │ │ R$ YY,YY    │ │ +/- X%      │     │
│  │ [Progress]  │ │ [Progress]  │ │             │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                        │
│  Visual Comparison (2-column charts)                   │
│  ┌──────────────────┐ ┌──────────────────┐           │
│  │ Budget vs Actual │ │ Expense Dist.    │           │
│  │ [Bar Chart]      │ │ [Donut Chart]    │           │
│  └──────────────────┘ └──────────────────┘           │
│                                                        │
│  Category Breakdown                                    │
│  ┌────────────────────────────────────────────────┐   │
│  │ Category          Budget    Actual    Status   │   │
│  │ ─────────────────────────────────────────────  │   │
│  │ 🏠 Moradia        R$ 2,000  R$ 1,850  [████░] │   │
│  │ 🚗 Transporte     R$ 1,000  R$ 1,200  [█████]⚠│   │
│  │ 🍔 Alimentação    R$ 1,500  R$ 1,400  [████░] │   │
│  │ ...                                            │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Top Transactions                                      │
│  ┌────────────────────────────────────────────────┐   │
│  │ 5 maiores despesas do mês                      │   │
│  │ • Aluguel - R$ 1,500 - 01/01                   │   │
│  │ • Supermercado - R$ 450 - 15/01                │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### Key Features
- **Enhanced Month Selector**: Prev/next arrows + "Today" quick button
- **Larger Summary Cards**: More prominent display with better visual hierarchy
- **Dual Chart View**: Side-by-side comparison chart and distribution chart
- **Interactive Category Rows**: Click to expand and see subcategory breakdown
- **Status Indicators**: Clear visual indicators (✓ under budget, ⚠ approaching, ⚠ over)
- **Top Transactions**: Shows 5 largest expenses to provide context
- **Clean Design**: More whitespace, larger fonts, better color coding

#### Component Changes
- Enhance `SummaryCard` component with better styling and animations
- Update `GroupBreakdown` with collapsible subcategories
- Create new `TopTransactions` component
- Improve chart components with better colors and labels

---

### 3.3 Year Tab (Enhanced)

#### Layout Structure
```
┌────────────────────────────────────────────────────────┐
│  Year Selector: [< 2025 >]                             │
│                                                        │
│  Annual Summary (4-column)                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐             │
│  │Income│ │Expense│ │Balance│ │ Savings  │             │
│  │R$ XXX│ │R$ YYY │ │R$ ZZZ │ │ Rate: XX%│             │
│  └──────┘ └──────┘ └──────┘ └──────────┘             │
│                                                        │
│  Monthly Performance Grid                              │
│  ┌────────────────────────────────────────────────┐   │
│  │ Month     Income    Expense   Balance   Status │   │
│  │ ─────────────────────────────────────────────  │   │
│  │ Jan       R$ X,XXX  R$ Y,YYY  R$ Z,ZZZ  ✓     │   │
│  │ Fev       R$ X,XXX  R$ Y,YYY  R$ Z,ZZZ  ⚠     │   │
│  │ Mar       R$ X,XXX  R$ Y,YYY  R$ Z,ZZZ  ✓     │   │
│  │ ...                                            │   │
│  │ [Click any month to drill down]                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Trend Visualization                                   │
│  ┌────────────────────────────────────────────────┐   │
│  │ Income & Expense Trend                         │   │
│  │ [Line Chart showing both over 12 months]       │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Category Annual Performance                           │
│  ┌────────────────────────────────────────────────┐   │
│  │ Category    Budgeted    Actual    Variance     │   │
│  │ ──────────────────────────────────────────────│   │
│  │ Moradia     R$ 24,000   R$ 22,800  -R$ 1,200✓│   │
│  │ Transporte  R$ 12,000   R$ 13,500  +R$ 1,500⚠│   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### Key Features
- **Compact Annual Summary**: 4 key metrics in a row
- **Interactive Monthly Grid**: Click any month to jump to Month tab for that period
- **Dual-Axis Line Chart**: Shows income and expense trends together
- **Category Annual Summary**: Year totals by category with variance
- **Performance Heatmap Option**: Consider adding a heatmap view showing good/bad months
- **Export Option**: "Export Annual Report" button

#### Component Changes
- Simplify `YearlySummary` component - make it more compact
- Enhance `MonthlyBreakdownTable` with better interactivity
- Update `MonthlyTrendChart` to show both income and expenses
- Refactor `YearlyCategoryTrends` for cleaner presentation

---

### 3.4 Trends Tab (NEW)

#### Layout Structure
```
┌────────────────────────────────────────────────────────┐
│  Time Period: [Last 3M] [Last 6M] [Last 12M] [Custom] │
│                                                        │
│  Trend Metrics (3-column)                              │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐   │
│  │ Avg Monthly  │ │ Budget       │ │ Savings     │   │
│  │ Savings      │ │ Adherence    │ │ Trend       │   │
│  │ R$ X,XXX     │ │ XX%          │ │ [Sparkline] │   │
│  │ +X% vs prev  │ │ Improving ✓  │ │ +X% MoM     │   │
│  └──────────────┘ └──────────────┘ └─────────────┘   │
│                                                        │
│  Category Spending Trends                              │
│  ┌────────────────────────────────────────────────┐   │
│  │ [Multi-line chart showing top 5 categories]    │   │
│  │ Shows spending evolution over selected period  │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Budget vs Actual Variance                             │
│  ┌────────────────────────────────────────────────┐   │
│  │ [Area chart showing variance over time]        │   │
│  │ Positive area = under budget, Negative = over  │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Insights & Patterns                                   │
│  ┌────────────────────────────────────────────────┐   │
│  │ • Spending on "Alimentação" increased 15%      │   │
│  │ • You saved more than planned 3/6 months       │   │
│  │ • Best month: Janeiro (R$ 2,500 saved)         │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

#### Key Features
- **Time Period Selector**: Quick filters for common periods
- **Trend KPIs**: High-level metrics with comparison to previous period
- **Multi-Category Line Chart**: Shows spending evolution for top categories
- **Variance Area Chart**: Visualizes budget adherence over time
- **AI-like Insights**: Automatically generated observations about patterns
- **Comparative Analysis**: Month-over-month and period-over-period changes

#### Data Requirements
- New hook: `useTrendCalculations(transactions, budgets, startDate, endDate)`
- Calculate period-over-period changes
- Identify top spending categories
- Calculate variance trends
- Generate pattern insights

---

## 4. Component Architecture

### New Components to Create

#### 4.1 `TabNavigation.tsx`
```typescript
interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}
```
- Horizontal tab bar with smooth transition
- Active state indicator (underline or background)
- Responsive: becomes dropdown on mobile

#### 4.2 `HeroCard.tsx`
```typescript
interface HeroCardProps {
  title: string
  value: number
  target: number
  percentage: number
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}
```
- Large, prominent card for key metrics
- Progress bar with gradient
- Trend indicator with icon

#### 4.3 `MetricCard.tsx`
```typescript
interface MetricCardProps {
  label: string
  value: number | string
  sublabel?: string
  status?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}
```
- Flexible card for displaying single metrics
- Size variants for different contexts
- Status-based color coding

#### 4.4 `TopTransactions.tsx`
```typescript
interface TopTransactionsProps {
  transactions: Transaction[]
  limit?: number
  type?: 'expense' | 'earning'
}
```
- Shows top N transactions
- Displays category icon, name, amount, date
- Click to see transaction details

#### 4.5 `TrendSparkline.tsx`
```typescript
interface TrendSparklineProps {
  data: number[]
  trend: 'up' | 'down' | 'neutral'
  color?: string
}
```
- Mini line chart for trends
- Compact size for inline use
- Shows directional trend

#### 4.6 `AlertBanner.tsx`
```typescript
interface Alert {
  type: 'warning' | 'success' | 'info'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface AlertBannerProps {
  alerts: Alert[]
}
```
- Displays contextual alerts and recommendations
- Dismissible
- Action button support

#### 4.7 `CategoryProgressRow.tsx`
```typescript
interface CategoryProgressRowProps {
  category: GroupSummary
  isExpandable?: boolean
  onExpand?: () => void
  subcategories?: SubcategorySummary[]
}
```
- Enhanced row with better visuals
- Collapsible for subcategories
- Status indicators and icons

#### 4.8 `PeriodSelector.tsx` (Enhanced)
- Add "Today" quick button
- Better mobile layout
- Preset date ranges

#### 4.9 `PerformanceHeatmap.tsx`
```typescript
interface PerformanceHeatmapProps {
  data: {
    month: number
    value: number
  }[]
  thresholds: {
    good: number
    medium: number
  }
}
```
- Calendar-style heatmap for 12 months
- Color-coded by performance
- Hover shows details

#### 4.10 `InsightsList.tsx`
```typescript
interface Insight {
  type: 'observation' | 'recommendation'
  message: string
  icon?: React.ReactNode
}

interface InsightsListProps {
  insights: Insight[]
}
```
- Displays automatically generated insights
- Icon-based visual hierarchy

### Components to Enhance

1. **SummaryCard.tsx**: Larger text, better progress bars, animations
2. **GroupBreakdown.tsx**: Add expand/collapse, better status indicators
3. **YearlySummary.tsx**: More compact, cleaner layout
4. **MonthlyBreakdownTable.tsx**: Better interactivity, hover states
5. **Charts**: Consistent color scheme, better labels, tooltips

---

## 5. Design System Enhancements

### Color Semantics
```typescript
// Status Colors
const statusColors = {
  excellent: colors.success[600],    // Over-saved, ahead of budget
  good: colors.success[400],         // On track
  warning: colors.warning[500],      // Approaching limit (>80%)
  danger: colors.error[500],         // Over budget
  neutral: colors.neutral[400],      // No budget/data
}
```

### Typography Scale
```typescript
// Dashboard-specific text sizes
const dashboardTypography = {
  heroValue: '3.75rem',     // 60px - for main YTD savings
  cardValue: '2.25rem',     // 36px - for summary cards
  metricValue: '1.5rem',    // 24px - for smaller metrics
  label: '0.875rem',        // 14px - for labels
  sublabel: '0.75rem',      // 12px - for subtexts
}
```

### Spacing & Layout
- **Generous whitespace**: Minimum 24px between major sections
- **Card padding**: 24px (increased from current 16px)
- **Grid gaps**: 24px for major grids, 16px for compact grids
- **Max content width**: 1400px for better readability

### Visual Hierarchy Rules
1. **Primary metrics** (hero values): 60px font, bold, primary color
2. **Secondary metrics** (cards): 36px font, semibold, contextual color
3. **Tertiary metrics** (table values): 24px font, medium, gray
4. **Labels**: 14px font, medium, gray-600
5. **Sublabels**: 12px font, normal, gray-500

### Animations & Transitions
```typescript
const dashboardAnimations = {
  tabSwitch: {
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardHover: {
    transform: 'translateY(-2px)',
    shadow: shadows.lg,
    duration: '200ms',
  },
  progressBar: {
    duration: '800ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  numberCounter: {
    duration: '1000ms',
    easing: 'ease-out',
  },
}
```

---

## 6. Data Calculations & Hooks

### New Hooks to Create

#### 6.1 `useYTDCalculations.ts`
```typescript
interface YTDSummary {
  totalIncome: number
  totalExpense: number
  totalSavings: number
  budgetedSavings: number
  savingsPercentage: number
  savingsRate: number // Savings as % of income
  monthsCompleted: number
}

export const useYTDCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  year: number,
  currentMonth: number
): YTDSummary
```

#### 6.2 `useTrendCalculations.ts`
```typescript
interface TrendData {
  categoryTrends: {
    categoryId: number
    categoryName: string
    data: { month: string; value: number }[]
  }[]
  varianceTrend: { month: string; variance: number }[]
  savingsTrend: { month: string; savings: number }[]
  budgetAdherence: number // 0-100 score
  insights: Insight[]
}

export const useTrendCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  startDate: string,
  endDate: string
): TrendData
```

#### 6.3 `useTopTransactions.ts`
```typescript
export const useTopTransactions = (
  transactions: Transaction[],
  year: number,
  month: number,
  type: 'expense' | 'earning',
  limit: number = 5
): Transaction[]
```

#### 6.4 `useAlerts.ts`
```typescript
interface Alert {
  type: 'warning' | 'success' | 'info'
  message: string
  category?: string
  action?: {
    label: string
    route: string
  }
}

export const useAlerts = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number,
  month: number
): Alert[]
```
Logic for generating alerts:
- Categories over 80% of budget: Warning
- Categories over 100% of budget: Danger
- On track to meet savings goal: Success
- Best performing category: Success

#### 6.5 `usePerformanceScore.ts`
```typescript
interface PerformanceScore {
  score: number // 0-100
  breakdown: {
    budgetAdherence: number
    savingsRate: number
    consistency: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export const usePerformanceScore = (
  transactions: Transaction[],
  budgets: Budget[],
  startDate: string,
  endDate: string
): PerformanceScore
```

### Enhanced Hooks

#### Update `useBudgetCalculations.ts`
- Add subcategory summaries
- Add top transactions
- Add variance calculations

#### Update `useYearlyCalculations.ts`
- Add category-wise annual summaries
- Add best/worst month analysis
- Add average calculations

---

## 7. Implementation Steps

### Phase 1: Foundation (Implement Tab System)
**Duration**: 1-2 days

1. Create `TabNavigation` component
2. Add new view mode constants: `OVERVIEW`, `MONTH`, `YEAR`, `TRENDS`
3. Update `DashboardPage.tsx` to use tab navigation
4. Update `AppContext` to store active tab
5. Implement tab switching logic with localStorage persistence

**Files to modify**:
- `src/constants/viewModes.ts` (add new modes)
- `src/context/AppContext.tsx` (add activeTab state)
- `src/components/common/TabNavigation.tsx` (new)
- `src/pages/DashboardPage.tsx` (refactor)

### Phase 2: Overview Tab (Hero View)
**Duration**: 2-3 days

1. Create `useYTDCalculations` hook
2. Create `HeroCard` component
3. Create `MetricCard` component
4. Create `TrendSparkline` component
5. Create `AlertBanner` component
6. Create `useAlerts` hook
7. Create `OverviewTab.tsx` component with all sections
8. Integrate into `DashboardPage`

**Files to create**:
- `src/hooks/useYTDCalculations.ts`
- `src/hooks/useAlerts.ts`
- `src/components/dashboard/HeroCard.tsx`
- `src/components/dashboard/MetricCard.tsx`
- `src/components/dashboard/TrendSparkline.tsx`
- `src/components/dashboard/AlertBanner.tsx`
- `src/components/dashboard/OverviewTab.tsx`

### Phase 3: Month Tab Enhancement
**Duration**: 2-3 days

1. Create `useTopTransactions` hook
2. Create `TopTransactions` component
3. Create `CategoryProgressRow` component
4. Enhance `SummaryCard` with better styling
5. Enhance `GroupBreakdown` with expand/collapse
6. Update `PeriodSelector` with "Today" button
7. Create `MonthTab.tsx` component
8. Refactor existing monthly view logic

**Files to modify/create**:
- `src/hooks/useTopTransactions.ts` (new)
- `src/components/dashboard/TopTransactions.tsx` (new)
- `src/components/dashboard/CategoryProgressRow.tsx` (new)
- `src/components/dashboard/SummaryCard.tsx` (enhance)
- `src/components/dashboard/GroupBreakdown.tsx` (enhance)
- `src/components/common/PeriodSelector.tsx` (enhance)
- `src/components/dashboard/MonthTab.tsx` (new)

### Phase 4: Year Tab Enhancement
**Duration**: 2-3 days

1. Create `PerformanceHeatmap` component
2. Enhance `YearlySummary` for compact display
3. Update `MonthlyBreakdownTable` with better interactivity
4. Update `MonthlyTrendChart` to show dual-axis
5. Refactor `YearlyCategoryTrends` for cleaner display
6. Create `YearTab.tsx` component
7. Add drill-down functionality (click month → jump to Month tab)

**Files to modify/create**:
- `src/components/dashboard/PerformanceHeatmap.tsx` (new)
- `src/components/dashboard/YearlySummary.tsx` (enhance)
- `src/components/dashboard/MonthlyBreakdownTable.tsx` (enhance)
- `src/components/dashboard/MonthlyTrendChart.tsx` (enhance)
- `src/components/dashboard/YearlyCategoryTrends.tsx` (enhance)
- `src/components/dashboard/YearTab.tsx` (new)

### Phase 5: Trends Tab (New)
**Duration**: 3-4 days

1. Create `useTrendCalculations` hook
2. Create `PeriodRangeSelector` component
3. Create `CategoryTrendChart` component (multi-line)
4. Create `VarianceAreaChart` component
5. Create `InsightsList` component
6. Create trend analysis utilities
7. Create `TrendsTab.tsx` component
8. Implement insight generation logic

**Files to create**:
- `src/hooks/useTrendCalculations.ts`
- `src/components/dashboard/PeriodRangeSelector.tsx`
- `src/components/dashboard/CategoryTrendChart.tsx`
- `src/components/dashboard/VarianceAreaChart.tsx`
- `src/components/dashboard/InsightsList.tsx`
- `src/components/dashboard/TrendsTab.tsx`
- `src/utils/insights.ts`

### Phase 6: Design Polish
**Duration**: 2-3 days

1. Apply consistent spacing across all components
2. Implement hover animations and transitions
3. Add loading states for data calculations
4. Implement skeleton loaders
5. Add empty states with helpful messages
6. Improve responsive design for mobile
7. Test and refine color scheme
8. Add micro-interactions (number counters, progress animations)

**Files to modify**:
- All dashboard components (add animations)
- `src/components/common/LoadingState.tsx` (new)
- `src/components/common/EmptyState.tsx` (new)
- Update Tailwind config if needed

### Phase 7: Testing & Refinement
**Duration**: 2-3 days

1. Write tests for new hooks
   - `useYTDCalculations.test.ts`
   - `useTrendCalculations.test.ts`
   - `useAlerts.test.ts`
   - `useTopTransactions.test.ts`

2. Write component tests
   - `TabNavigation.test.tsx`
   - `HeroCard.test.tsx`
   - `MetricCard.test.tsx`
   - `OverviewTab.test.tsx`
   - `TrendsTab.test.tsx`

3. Integration testing
   - Test tab navigation flow
   - Test drill-down from Year to Month
   - Test period selector interactions

4. Manual testing
   - Test with real data
   - Test with edge cases (no data, partial data)
   - Test responsive design on various devices

5. Performance optimization
   - Optimize calculations with memoization
   - Lazy load chart libraries
   - Code splitting for tabs

**Test files to create**:
- `src/hooks/__tests__/useYTDCalculations.test.ts`
- `src/hooks/__tests__/useTrendCalculations.test.ts`
- `src/hooks/__tests__/useAlerts.test.ts`
- `src/components/dashboard/__tests__/TabNavigation.test.tsx`
- `src/components/dashboard/__tests__/OverviewTab.test.tsx`

### Phase 8: Documentation & Cleanup
**Duration**: 1 day

1. Update README with new dashboard features
2. Add inline documentation for complex calculations
3. Create visual documentation (screenshots)
4. Clean up unused code
5. Update CHANGELOG.md
6. Final code review

---

## 8. Testing Strategy

### Unit Tests
Test all calculation hooks thoroughly:
- `useYTDCalculations`: Verify YTD sums, percentages, savings rate
- `useTrendCalculations`: Verify trend data accuracy, period filtering
- `useAlerts`: Verify alert generation logic, thresholds
- `useTopTransactions`: Verify sorting, filtering, limit

### Component Tests
Test user interactions:
- Tab navigation switches views correctly
- Period selectors update data
- Click-through navigation (Year → Month)
- Alert actions work
- Expand/collapse interactions

### Integration Tests
- Full dashboard flow from Overview → Month → Year → Trends
- Data consistency across tabs
- State persistence (localStorage)

### Visual Regression Tests (Optional)
- Screenshot comparison for major views
- Use Chromatic or Percy if budget allows

---

## 9. Mobile Responsiveness Strategy

### Breakpoint Behavior

#### Mobile (< 768px)
- Stack all cards vertically
- Single column layout
- Tab navigation becomes dropdown
- Compact charts (smaller, simpler)
- Hide less critical metrics
- Condensed table views (scrollable)

#### Tablet (768px - 1024px)
- 2-column grid for cards
- Show all tabs in horizontal layout
- Medium-sized charts
- Show most metrics

#### Desktop (> 1024px)
- 3-4 column grids
- Full tab bar
- Full-sized charts
- All metrics visible
- Side-by-side comparisons

### Touch Interactions
- Swipe between tabs on mobile
- Tap to expand categories
- Pull to refresh data
- Long-press for context menu (optional)

---

## 10. Performance Considerations

### Optimization Techniques
1. **Memoization**: Use `useMemo` for expensive calculations
2. **Code Splitting**: Lazy load tab components
3. **Chart Libraries**: Load chart library only when needed
4. **Virtual Scrolling**: For long transaction lists (if added later)
5. **Debouncing**: Period selector changes
6. **IndexedDB Queries**: Optimize with indexes

### Expected Performance
- Initial load: < 2 seconds
- Tab switch: < 300ms
- Period change: < 500ms
- Chart render: < 1 second

---

## 11. Success Metrics

### User Experience Metrics
- Time to understand current financial status: **< 5 seconds**
- Clicks to reach monthly detail: **1 click** (from Overview)
- Users who interact with all 4 tabs: **> 70%**
- Mobile usage satisfaction: **High** (responsive design works well)

### Technical Metrics
- Page load time: **< 2 seconds**
- Tab switch latency: **< 300ms**
- Test coverage: **> 80%**
- Zero accessibility violations (WCAG AA)

---

## 12. Future Enhancements (Post-MVP)

### Phase 9+ (Future Ideas)
1. **Export Reports**: PDF/Excel export of dashboard data
2. **Custom Date Ranges**: Select any date range for analysis
3. **Goal Setting**: Set savings goals and track progress
4. **Forecasting**: Predict future expenses based on trends
5. **Budget Templates**: Save and reuse budget configurations
6. **Comparison Mode**: Compare different months/years side-by-side
7. **Dark Mode**: Full dark theme support
8. **Animations**: More sophisticated transitions and celebrations (confetti on goals met)
9. **Insights AI**: More intelligent pattern recognition
10. **Widgets**: Dashboard widgets for quick access

---

## 13. File Structure Summary

```
src/
├── components/
│   ├── dashboard/
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx       [NEW]
│   │   │   ├── MonthTab.tsx          [NEW]
│   │   │   ├── YearTab.tsx           [NEW]
│   │   │   └── TrendsTab.tsx         [NEW]
│   │   ├── TabNavigation.tsx         [NEW]
│   │   ├── HeroCard.tsx              [NEW]
│   │   ├── MetricCard.tsx            [NEW]
│   │   ├── TrendSparkline.tsx        [NEW]
│   │   ├── AlertBanner.tsx           [NEW]
│   │   ├── TopTransactions.tsx       [NEW]
│   │   ├── CategoryProgressRow.tsx   [NEW]
│   │   ├── PerformanceHeatmap.tsx    [NEW]
│   │   ├── PeriodRangeSelector.tsx   [NEW]
│   │   ├── CategoryTrendChart.tsx    [NEW]
│   │   ├── VarianceAreaChart.tsx     [NEW]
│   │   ├── InsightsList.tsx          [NEW]
│   │   ├── SummaryCard.tsx           [ENHANCED]
│   │   ├── GroupBreakdown.tsx        [ENHANCED]
│   │   ├── YearlySummary.tsx         [ENHANCED]
│   │   ├── MonthlyBreakdownTable.tsx [ENHANCED]
│   │   ├── MonthlyTrendChart.tsx     [ENHANCED]
│   │   └── YearlyCategoryTrends.tsx  [ENHANCED]
│   └── common/
│       ├── PeriodSelector.tsx        [ENHANCED]
│       ├── LoadingState.tsx          [NEW]
│       └── EmptyState.tsx            [NEW]
├── hooks/
│   ├── useYTDCalculations.ts         [NEW]
│   ├── useTrendCalculations.ts       [NEW]
│   ├── useTopTransactions.ts         [NEW]
│   ├── useAlerts.ts                  [NEW]
│   ├── useBudgetCalculations.ts      [ENHANCED]
│   └── useYearlyCalculations.ts      [ENHANCED]
├── utils/
│   └── insights.ts                   [NEW]
├── constants/
│   └── viewModes.ts                  [ENHANCED]
└── pages/
    └── DashboardPage.tsx             [REFACTORED]
```

---

## 14. Developer Execution Checklist

Use this checklist when implementing:

### Pre-Implementation
- [ ] Review and understand current codebase structure
- [ ] Review design system constants
- [ ] Set up testing environment
- [ ] Create feature branch: `feature/dashboard-redesign`

### Phase 1: Foundation
- [ ] Create view mode constants
- [ ] Implement TabNavigation component
- [ ] Update AppContext with tab state
- [ ] Refactor DashboardPage for tabs
- [ ] Test tab switching
- [ ] Commit: "feat: add tab navigation system"

### Phase 2: Overview Tab
- [ ] Create useYTDCalculations hook with tests
- [ ] Create HeroCard component
- [ ] Create MetricCard component
- [ ] Create TrendSparkline component
- [ ] Create useAlerts hook with tests
- [ ] Create AlertBanner component
- [ ] Assemble OverviewTab component
- [ ] Test with sample data
- [ ] Commit: "feat: implement overview tab"

### Phase 3: Month Tab
- [ ] Create useTopTransactions hook with tests
- [ ] Create TopTransactions component
- [ ] Create CategoryProgressRow component
- [ ] Enhance SummaryCard styling
- [ ] Enhance GroupBreakdown with expand/collapse
- [ ] Update PeriodSelector with "Today" button
- [ ] Assemble MonthTab component
- [ ] Test all interactions
- [ ] Commit: "feat: enhance month tab"

### Phase 4: Year Tab
- [ ] Create PerformanceHeatmap component
- [ ] Refactor YearlySummary for compact view
- [ ] Enhance MonthlyBreakdownTable interactivity
- [ ] Update MonthlyTrendChart for dual-axis
- [ ] Refactor YearlyCategoryTrends
- [ ] Assemble YearTab component
- [ ] Implement drill-down navigation
- [ ] Test all interactions
- [ ] Commit: "feat: enhance year tab"

### Phase 5: Trends Tab
- [ ] Create useTrendCalculations hook with tests
- [ ] Create PeriodRangeSelector component
- [ ] Create CategoryTrendChart component
- [ ] Create VarianceAreaChart component
- [ ] Create InsightsList component
- [ ] Create insights generation utilities
- [ ] Assemble TrendsTab component
- [ ] Test with various time periods
- [ ] Commit: "feat: implement trends tab"

### Phase 6: Design Polish
- [ ] Apply consistent spacing
- [ ] Implement hover animations
- [ ] Add loading states
- [ ] Create skeleton loaders
- [ ] Add empty states
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Refine colors and visual hierarchy
- [ ] Add micro-interactions
- [ ] Commit: "style: polish dashboard design"

### Phase 7: Testing
- [ ] Write hook tests (YTD, Trends, Alerts, TopTransactions)
- [ ] Write component tests (Tab Navigation, Cards, Charts)
- [ ] Write integration tests (tab flows, drill-down)
- [ ] Manual testing with real data
- [ ] Test edge cases (empty data, partial data)
- [ ] Performance testing and optimization
- [ ] Cross-browser testing
- [ ] Accessibility testing
- [ ] Commit: "test: add comprehensive test coverage"

### Phase 8: Documentation
- [ ] Update README.md
- [ ] Add inline code documentation
- [ ] Create visual documentation (screenshots)
- [ ] Update CHANGELOG.md
- [ ] Clean up unused code
- [ ] Final code review
- [ ] Commit: "docs: update documentation for dashboard redesign"

### Final Steps
- [ ] Merge feature branch to main
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Gather user feedback
- [ ] Plan next iteration

---

## 15. Key Technical Decisions

### Why Tabs Instead of Single Page?
- **Better organization**: Each tab has a clear purpose
- **Reduced cognitive load**: Users see one view at a time
- **Performance**: Lazy load inactive tabs
- **Scalability**: Easy to add more views later

### Why Four Tabs?
- **Overview**: Quick health check (new user need)
- **Month**: Detailed current period (existing, enhanced)
- **Year**: Annual planning (existing, enhanced)
- **Trends**: Historical analysis (new analytical need)

### Why YTD in Overview?
- Most users care about "this year so far"
- Provides context beyond current month
- Helps track annual goals

### Chart Library Choice
Continue using existing chart library (Recharts assumed) for consistency. If not using one, recommend:
- **Recharts**: Easy to use, good for this use case
- **Chart.js**: Lightweight alternative
- **D3.js**: If very custom visualizations needed (overkill for MVP)

### State Management
Continue using React Context. Current approach is sufficient for this app size. No need for Redux/Zustand.

---

## 16. Risk Mitigation

### Potential Risks & Solutions

1. **Risk**: Implementation takes longer than estimated
   - **Mitigation**: Implement in phases, ship Phase 1-3 first if needed

2. **Risk**: Performance issues with large datasets
   - **Mitigation**: Implement pagination, virtual scrolling, limit data queries

3. **Risk**: Mobile design doesn't work well
   - **Mitigation**: Design mobile-first, test early and often

4. **Risk**: Users don't understand new navigation
   - **Mitigation**: Add onboarding tooltips, use clear labels

5. **Risk**: Calculations are incorrect
   - **Mitigation**: Comprehensive test coverage, validate against existing data

---

## 17. Conclusion

This plan transforms the dashboard from a functional tool into a **beautiful, insightful financial command center**. The multi-tab approach provides clarity and organization, while the new visualizations and metrics help users truly understand their financial health.

The implementation is structured in phases to allow for iterative development and early testing. Each phase builds on the previous one, creating a solid foundation for future enhancements.

**Expected Outcome**: A dashboard that users **love to use** and that provides **genuine insights** into their financial behavior, helping them make better decisions and achieve their goals.

---

## Appendix: Design Mockup Text Representations

### Overview Tab
```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                             │
├─────────────────────────────────────────────────────────────┤
│  [Overview*] [Month] [Year] [Trends]                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🎯 Year-to-Date Savings                                ││
│  │                                                          ││
│  │  R$ 15.450,00 / R$ 20.000,00  (77%)                    ││
│  │  ████████████████████████████████░░░░░░░                ││
│  │                                                          ││
│  │  On track to meet your annual savings goal! 💪          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Current Month: Janeiro 2025                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Receitas    │  │  Despesas    │  │  Saldo       │     │
│  │              │  │              │  │              │     │
│  │  R$ 5.200    │  │  R$ 3.800    │  │  R$ 1.400    │     │
│  │  104% ✓      │  │  95% ✓       │  │  +27%        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │  Top Categories        │  │  Recent Trend          │    │
│  │                        │  │                        │    │
│  │  🏠 Moradia  R$ 1.800 │  │  Last 3 Months        │    │
│  │  🍔 Alimentação R$ 900│  │      ╱╲                │    │
│  │  🚗 Transporte R$ 600 │  │    ╱    ╲    ╱        │    │
│  │  ⚡ Outros    R$ 500  │  │  ╱        ╲╱          │    │
│  │                        │  │  Improving ↗ +12%     │    │
│  └────────────────────────┘  └────────────────────────┘    │
│                                                              │
│  ⚠ Alerts & Insights                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ⚠ Alimentação: 85% of budget used (15 days left)       ││
│  │ ✓ Great job! You're under budget in 7/9 categories     ││
│  │ 💡 Consider moving R$200 from Lazer to savings         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Month Tab
```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                             │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Month*] [Year] [Trends]                        │
│                                                              │
│  [< Janeiro 2025 >]  [Today]                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Receitas    │  │  Despesas    │  │  Saldo Mensal│     │
│  │              │  │              │  │              │     │
│  │  Previsto    │  │  Previsto    │  │  R$ 1.400   │     │
│  │  R$ 5.000    │  │  R$ 4.000    │  │              │     │
│  │              │  │              │  │  +27% da     │     │
│  │  Realizado   │  │  Realizado   │  │  receita     │     │
│  │  R$ 5.200    │  │  R$ 3.800    │  │              │     │
│  │  ███████░ 104%│  │  ██████░ 95%│  │  ✓ Poupando │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Budget vs Actual    │  │  Expense Distribution│        │
│  │  ┌──────┐  ┌──────┐ │  │         🍰           │        │
│  │  │      │  │ ███  │ │  │    ╱────────╲        │        │
│  │  │ ███  │  │ ███  │ │  │   │  Moradia │       │        │
│  │  │ ███  │  │ ███  │ │  │   │   47%    │       │        │
│  │  └──────┘  └──────┘ │  │    ╲────────╱        │        │
│  │  Budget   Actual     │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  Category Breakdown                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Category        Budget    Actual    Remaining   Status  ││
│  │ ────────────────────────────────────────────────────    ││
│  │ 🏠 Moradia      R$ 2.000  R$ 1.850  R$ 150      ████░  ││
│  │ 🍔 Alimentação  R$ 1.000  R$ 850    R$ 150      ████░  ││
│  │ 🚗 Transporte   R$ 800    R$ 600    R$ 200      ███░░  ││
│  │ ⚡ Outros       R$ 200    R$ 500   -R$ 300      █████⚠││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Top Transactions This Month                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ • Aluguel - R$ 1.500 - 01/01 - Moradia                 ││
│  │ • Supermercado - R$ 450 - 15/01 - Alimentação          ││
│  │ • Gasolina - R$ 300 - 10/01 - Transporte               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```
