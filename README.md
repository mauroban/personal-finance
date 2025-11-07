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
```

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
- **MSI:** `src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.1_x64_en-US.msi`
- **NSIS:** `src-tauri/target/release/bundle/nsis/Simple Budget Tracker_1.0.1_x64-setup.exe`

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
- **Windows:** `src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.1_x64_en-US.msi`
- **macOS:** `src-tauri/target/release/bundle/dmg/Simple Budget Tracker_1.0.1_x64.dmg`

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

When you first open the app, go to **Configuração** (Setup) to:

1. **Add Expense Categories**: Create main categories (e.g., "Alimentação", "Transporte") and optional subcategories
2. **Add Income Sources**: Define your income sources (e.g., "Salário", "Freelance")

**Tip**: Use the Brazilian default categories listed in `docs/product-context.md` for guidance.

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

The **Dashboard** provides comprehensive financial insights:

#### Monthly View

- See your actual income vs. forecasted income
- Track expenses against your budget
- View your net balance (savings or deficit)
- See category-by-category breakdowns with progress bars
- Green indicators mean you're within budget, red means over budget

#### Yearly View

Click **Anual** to access yearly analytics:

1. **Annual Summary Card**:
   - Total income, expenses, and balance for the year
   - Planned vs actual comparison with variance analysis
   - Savings rate percentage
   - Key insights (best/worst months, monthly averages)

2. **Monthly Breakdown Table**:
   - All 12 months with planned vs actual for income and expenses
   - Variance calculations showing over/under performance
   - Click any month to drill down to monthly detail view

3. **Category Trends Analysis**:
   - Yearly performance for each expense category
   - Expandable sections showing month-by-month details
   - Visual progress bars and budget execution percentages
   - Identify categories that are over or under budget

This yearly view is essential for:
- Annual financial planning and goal setting
- Identifying spending patterns and trends
- Comparing performance across months
- Understanding seasonal variations in income/expenses

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
✅ **Local-first data storage** - All data stays on your device
✅ **Pre-loaded Brazilian categories** - 9 main categories with 40+ subcategories
✅ **Custom expense categories** with unlimited subcategories
✅ **Multiple income sources** tracking
✅ **Monthly budget planning** with subcategory support
✅ **Yearly budget overview** - 12-month grid with drill-down capability
✅ **Annual analytics** - Comprehensive yearly financial insights
✅ **Variance analysis** - Track planned vs actual for income and expenses
✅ **Category trends** - Yearly performance analysis by expense category
✅ **Recurrent budgets** - Mark monthly expenses to auto-copy
✅ **Transaction logging** with installment support
✅ **Collapsible category view** - Organize budgets by category and subcategory
✅ **Real-time budget vs. actual comparison**
✅ **Visual progress indicators** with color coding
✅ **Drill-down navigation** - Click months in yearly view to edit details
✅ **View mode persistence** - Your monthly/yearly preference is remembered
✅ **Export/Import backup system** (.json format with XSS protection)
✅ **Brazilian Real (BRL)** currency format
✅ **Portuguese UI** throughout

### UX & Accessibility
✅ **Mobile responsive design** - Optimized layouts for all screen sizes
✅ **Touch-friendly interface** - Smooth scrolling and mobile-optimized controls
✅ **Accessible modals** - ARIA attributes, focus management, keyboard navigation
✅ **Screen reader support** - Descriptive labels for all interactive elements
✅ **Keyboard navigation** - Arrow keys, Tab, Escape support throughout
✅ **Loading states** - Visual feedback during async operations
✅ **Error handling** - User-friendly error messages in modals

### Performance
✅ **Code splitting** - Lazy-loaded pages and components
✅ **Optimized bundle** - 61% smaller initial load (308KB vs 794KB)
✅ **Memoized callbacks** - Prevents unnecessary re-renders
✅ **Fast startup** - Only loads what you need, when you need it

## 🔒 Privacy

This app is designed with privacy in mind:
- No analytics or tracking
- No external API calls
- All data stays on your device
- No user accounts required

## 📄 License

This is a personal finance tool built for educational and personal use.
