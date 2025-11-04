# 💰 Simple Budget Tracker

A simple, local-first personal finance application built with React, TypeScript, and Tailwind CSS. Track your income and expenses, set monthly budgets, and gain clarity over your finances—all while keeping your data private and local.

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

## 📖 How to Use

### 1. First-Time Setup

When you first open the app, go to **Configuração** (Setup) to:

1. **Add Expense Categories**: Create main categories (e.g., "Alimentação", "Transporte") and optional subcategories
2. **Add Income Sources**: Define your income sources (e.g., "Salário", "Freelance")

**Tip**: Use the Brazilian default categories listed in `docs/product-context.md` for guidance.

### 2. Set Your Monthly Budget

Navigate to **Orçamento** (Budget):

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

The **Dashboard** is your main view:

- See your actual income vs. forecasted income
- Track expenses against your budget
- View your net balance (savings or deficit)
- See category-by-category breakdowns with progress bars
- Green indicators mean you're within budget, red means over budget

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

## 🌟 Features

✅ **Local-first data storage** - All data stays on your device
✅ **Pre-loaded Brazilian categories** - 9 main categories with 40+ subcategories
✅ **Custom expense categories** with unlimited subcategories
✅ **Multiple income sources** tracking
✅ **Monthly budget planning** with subcategory support
✅ **Recurrent budgets** - Mark monthly expenses to auto-copy
✅ **Transaction logging** with installment support
✅ **Collapsible category view** - Organize budgets by category and subcategory
✅ **Real-time budget vs. actual comparison**
✅ **Visual progress indicators** with color coding
✅ **Export/Import backup system** (.json format)
✅ **Brazilian Real (BRL)** currency format
✅ **Portuguese UI** throughout

## 🔒 Privacy

This app is designed with privacy in mind:
- No analytics or tracking
- No external API calls
- All data stays on your device
- No user accounts required

## 📄 License

This is a personal finance tool built for educational and personal use.
