# 💰 Simple Budget Tracker

A simple, local-first personal finance application built with React, TypeScript, and Tailwind CSS. Track your income and expenses, set monthly budgets, and gain clarity over your finances—all while keeping your data private and local.

**Available as both a web app and desktop application** (Windows & macOS)

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run all quality checks
npm run typecheck && npm run lint && npm test
```

**Test Coverage:**
- Utility functions (date formatting, calculations, data transformations)
- React hooks (budget calculations, data fetching)
- Component behavior (forms, modals, user interactions)
- Database operations (IndexedDB via Dexie.js)

See `docs/technical-context.md` for detailed testing philosophy and guidelines.

## 🖥️ Desktop Application

This app can be built as a **native desktop application** for Windows and macOS using Tauri!

✅ **Build Status:** Windows installers are ready! MSI and NSIS installers have been built and are available in `src-tauri/target/release/bundle/`.

### Why Desktop App?

- **No browser required** - Runs as a standalone application
- **Native look and feel** - Integrates with your operating system
- **Small bundle size** - ~60-100 MB (vs 150-250 MB with Electron)
- **Same features** - All web app functionality works identically
- **Easy distribution** - Users install like any other app, no dev tools needed

### Ready-to-Install Desktop Builds

**Windows Installers (Built & Ready):**
- **MSI:** `src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.3_x64_en-US.msi`
- **NSIS:** `src-tauri/target/release/bundle/nsis/Simple Budget Tracker_1.0.3_x64-setup.exe`

**App Icon:** A placeholder icon (blue with "$" symbol) is included. See [ICONS.md](./ICONS.md) for customization instructions.

### Building Desktop Installers

**Prerequisites:**
1. Install [Rust](https://rustup.rs/) (required for Tauri)
2. Platform-specific tools:
   - **Windows:** Visual Studio C++ Build Tools
   - **macOS:** Xcode Command Line Tools

**Build Commands:**
```bash
# Development mode (with hot reload)
npm run tauri:dev

# Build production installer
npm run tauri:build

# Regenerate app icons (after updating app-icon.svg)
npm run tauri icon app-icon.svg
```

**Output:**
- **Windows:** `src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.3_x64_en-US.msi`
- **macOS:** `src-tauri/target/release/bundle/dmg/Simple Budget Tracker_1.0.3_x64.dmg`

📖 **Full desktop build guide:** See [DESKTOP-BUILD.md](./DESKTOP-BUILD.md) for complete instructions, troubleshooting, and distribution tips.

## ✨ Key Feature: Yearly Planning

This app now includes comprehensive **yearly view capabilities** for both Dashboard and Budget pages:

- **Toggle between Monthly and Yearly views** using the "Mensal/Anual" buttons
- **Yearly Budget Overview**: See all 12 months in a grid, with instant visibility of which months have budgets
- **Annual Dashboard Analytics**: Get a complete picture of your financial year with variance analysis
- **Click-to-drill-down**: Click any month in yearly view to instantly switch to that month's detail
- **Persistent preferences**: Your view choice is saved in localStorage

This makes annual financial planning intuitive and gives you the big picture while maintaining easy access to monthly details.

## 📖 How to Use

### 1. First-Time Setup

**Good news:** The app comes **pre-loaded with 9 Brazilian expense categories and 40+ subcategories**!

When you first open the app, you can:
- Start budgeting immediately with default categories (Moradia, Transporte, Alimentação, etc.)
- Customize categories in **Configuração** (Setup) - add, edit, or delete as needed
- Add your own income sources or use the defaults (Salário, Freelance, Investimentos, Outros)

**See `docs/product-context.md` section 8 for the complete list of pre-loaded categories.**

### 2. Set Your Budget

Navigate to **Orçamento** (Budget):

#### Monthly View

1. Select the year and month
2. **Income Sources**:
   - Enter your forecasted income for each source
   - Click 🔄 to mark as **Recurrent** (will auto-apply to future months)
3. **Expense Categories**:
   - Categories are grouped with expandable subcategories (click ▶)
   - You can budget at the main category level or drill down to subcategories
   - Category totals show the sum of main + subcategory budgets
   - Click 🔄 to mark expenses as **Recurrent**
4. The app automatically calculates your expected balance

**Recurrent Budgets**: Mark regular monthly expenses (rent, subscriptions, etc.) as recurrent to automatically copy them to future months.

#### Yearly View

Click **Anual** to switch to yearly planning mode:

1. **12-Month Grid Overview**: See all months at a glance with income, expenses, and balance
2. **Category Breakdown Table**: View yearly budget totals for each expense category
3. **Click any month** to drill down and edit that month's budget in detail
4. **Annual Totals**: See projected income, expenses, and savings for the entire year
5. Use this view for annual planning and to identify months that need budget setup

### 3. Log Transactions

Go to **Transações** (Transactions):

1. Click **+ Nova Transação**
2. Choose between **Receita** (Income) or **Despesa** (Expense)
3. Fill in the details:
   - Value in BRL (R$)
   - Date (defaults to today)
   - Category/Source
   - Payment method (for expenses)
   - Installments (for split payments)
4. Click **Adicionar**

**Installments Feature**: If you enter more than 1 installment, the app will automatically create multiple future transactions splitting the total amount evenly.

### 4. Review Your Dashboard

The **Dashboard** provides comprehensive financial insights through a **4-tab navigation system**:

#### 📊 Overview Tab
Your financial health at a glance:
- **Monthly Health Hero** - Current month status with visual indicators
- **Alert Banner** - Important warnings about budget overruns or low balances
- **Performance Heatmap** - Visual calendar showing spending patterns
- **Top Transactions** - Recent activity summary
- **Spending Insights** - AI-like analysis of your habits

#### 📅 Month Tab
Detailed analysis of a specific month:
- Income vs forecasted income with progress indicators
- Expenses vs budget by category with progress bars
- Net balance (savings or deficit)
- Category breakdown with subcategory details
- Green indicators = within budget, red = over budget
- **Income/Expense Chart** - Visual comparison

#### 📈 Year Tab
Annual overview and planning:
1. **Annual Summary Card**:
   - Total income, expenses, and balance for the year
   - Planned vs actual comparison with variance analysis
   - Savings rate percentage
   - Key insights (best/worst months, monthly averages)

2. **Monthly Breakdown Table**:
   - All 12 months with planned vs actual
   - Variance calculations showing over/under performance
   - Click any month to drill down to Month tab

3. **Category Trends Analysis**:
   - Yearly performance for each expense category
   - Expandable sections showing month-by-month details
   - Visual progress bars and budget execution percentages

#### 📉 Trends Tab
Long-term pattern analysis:
- **Monthly Trend Chart** - Income/expense trends over time
- **Category Trend Chart** - Spending patterns by category
- **Variance Area Chart** - Budget vs actual visualization
- **Category Impact Analysis** - Which categories affect your budget most
- **Category Pie Chart** - Expense distribution

The dashboard uses **lazy loading** for optimal performance, loading each tab only when you need it.

### 5. Backup & Restore

Use the **Exportar** button in the navbar to download a `.json` backup of all your data.

Use **Importar** to restore from a backup file. This will replace all current data.

## 🗂️ Data Storage

- All data is stored **locally** in your browser using IndexedDB
- No cloud sync, no accounts, no servers
- Your data never leaves your device
- Regular backups are recommended (use Export feature)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper
- **React Router** - Navigation
- **Vite** - Build tool
- **Vitest** - Testing framework

## 📂 Project Structure

```
src/
├── components/     # React components
│   ├── common/     # Reusable UI components
│   ├── layout/     # Layout components
│   ├── setup/      # Setup page components
│   ├── budget/     # Budget page components
│   ├── transactions/  # Transaction components
│   └── dashboard/  # Dashboard components
├── context/        # React Context (state)
├── db/            # IndexedDB setup
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## 🧪 Testing

All tests follow the principle: **Test behavior, not implementation**.

See `docs/technical-context.md` for detailed testing guidelines.

## 📚 Documentation

- **Product Context**: See `docs/product-context.md` for product vision and user flows
- **Technical Context**: See `docs/technical-context.md` for architecture and development guidelines
- **Desktop Build Guide**: See `DESKTOP-BUILD.md` for complete Tauri build instructions
- **Icon Customization**: See `ICONS.md` for app icon generation and customization

## 🌟 Features

### Core Functionality
✅ **Local-first data storage** - All data stays on your device (IndexedDB)
✅ **Pre-loaded Brazilian categories** - 9 main categories with 40+ subcategories
✅ **Custom expense categories** with unlimited subcategories
✅ **Multiple income sources** tracking
✅ **Monthly budget planning** with subcategory support
✅ **Yearly budget overview** - 12-month grid with drill-down capability
✅ **Recurrent budgets** - Mark monthly expenses to auto-copy to future months
✅ **Installment budgets** - Specify N-month duration for planned expenses
✅ **Cash register input** - Type digits like a calculator (1234 → R$ 12,34)
✅ **Transaction logging** with installment support
✅ **Smart delete** - Preserves historical data when deleting recurring budgets
✅ **Collapsible category view** - Organize budgets by category and subcategory
✅ **Export/Import backup system** (.json format with XSS protection)
✅ **Brazilian Real (BRL)** currency format throughout
✅ **Portuguese UI** - Complete localization

### Advanced Dashboard Analytics
✅ **4-tab navigation** - Overview, Month, Year, Trends for different perspectives
✅ **Monthly Health Hero** - At-a-glance financial status with visual indicators
✅ **Performance Heatmap** - Calendar view showing spending patterns
✅ **Alert Banner** - Proactive warnings about budget overruns
✅ **Top Transactions** - Quick view of recent activity
✅ **Spending Insights** - Intelligent analysis of spending habits
✅ **Annual analytics** - Comprehensive yearly financial insights
✅ **Variance analysis** - Track planned vs actual with detailed breakdowns
✅ **Category trends** - Yearly performance analysis by expense category
✅ **Monthly Trend Charts** - Income/expense trends over time
✅ **Category Impact Analysis** - Identify which categories affect budget most
✅ **Visual progress indicators** - Color-coded bars and charts
✅ **Drill-down navigation** - Click months in yearly view to see details
✅ **Real-time calculations** - Instant budget vs. actual comparisons

### UX & Accessibility
✅ **Mobile responsive design** - Optimized layouts for all screen sizes
✅ **Touch-friendly interface** - Smooth scrolling and mobile-optimized controls
✅ **Accessible modals** - ARIA attributes, focus management, keyboard navigation
✅ **Screen reader support** - Descriptive labels for all interactive elements
✅ **Keyboard navigation** - Arrow keys, Tab, Escape support throughout
✅ **Loading states** - Visual feedback during async operations
✅ **Error handling** - User-friendly error messages with proper validation
✅ **View mode persistence** - Your tab/view preferences are remembered

### Performance & Architecture
✅ **Code splitting** - Lazy-loaded dashboard tabs for faster initial load
✅ **Optimized bundle** - 61% smaller initial load (308KB vs 794KB)
✅ **Memoized callbacks** - Prevents unnecessary re-renders
✅ **Fast startup** - Only loads what you need, when you need it
✅ **Bulk operations** - Efficient database operations with proper indexes
✅ **Schema versioning** - Database migration support (currently v2)

## 🔒 Privacy

This app is designed with privacy in mind:
- No analytics or tracking
- No external API calls
- All data stays on your device
- No user accounts required

## 📄 License

This is a personal finance tool built for educational and personal use.
