# 🪙 Product Context: Simple Budget Tracker

## 1. Vision & Executive Summary

To create an exceptionally simple, user-friendly, and modern personal finance tool that empowers users to gain clarity and control over their **finances (earnings and spending)**.

The system’s primary goal is to let users **define their own financial categories**, **create a monthly budget**, and **track real earnings and expenses** against it — all while keeping **data private and local**.

This tool should feel intuitive, pleasant, and effortless to use — like a personal notebook that’s *actually enjoyable* to maintain.

---

## 2. Core Problem & Target Audience

**Problem:**
Most personal finance tools are too complex, cluttered with features (like bank syncs or investments), or force users into cloud-based systems. People who want a **private, lightweight, and customizable** budgeting tool end up using messy spreadsheets or rigid apps that don’t match how they think.

**Target Audience:**
Individuals who want to take charge of their money intentionally. They are willing to log transactions manually in exchange for:

* **Simplicity**
* **Clarity**
* **Privacy**

They value control and ease of use above automation.

---

## 3. Guiding Principles

These are the **non-negotiable pillars** of the product:

1. **Frictionless User Experience:**
   The most critical goal. The user flow — from setup → budgeting → logging → comparing — must be seamless.
   The “Quick Add Transaction” flow should be **blazingly fast**, **minimal**, and **pleasant**.

2. **Modern & Friendly Design:**
   The interface should be calm, clear, and modern — with natural spacing, soft colors, and readable typography.
   Every action should feel lightweight and rewarding, not like bookkeeping.

3. **User-Owned Data (Local-First):**
   All data stays on the user’s device.
   No accounts, no syncing, no servers.
   Durability is achieved through **manual backups** (`Save As…`) that generate a simple `.json` file.

---

## 4. Non-Goals

To protect simplicity and focus:

* ❌ No bank or credit card integration (for now)
* ❌ No investment or debt tracking
* ❌ No cloud sync or multi-device login
* ❌ No multi-user or household collaboration
* ❌ No complex analytics (keep comparisons and summaries simple)

---

## 5. Core User Flow

The app will be centered around a **clear, four-step journey**.

---

### 1️⃣ First-Time Setup (Categories & Sources)

When users open the app for the first time, **default Brazilian categories are automatically loaded**:

* **9 main expense categories** with **40+ subcategories** pre-configured
* **4 default income sources** (Salário, Freelance, Investimentos, Outros)
* Users can immediately start budgeting without setup
* All categories are fully customizable - add, edit, or delete as needed

💡 **What's Pre-Loaded:**

* Categories like Moradia, Transporte, Alimentação, Saúde, Educação, Lazer, etc.
* Subcategories like Aluguel, Energia, Água, Combustível, Supermercado, etc.
* Common Brazilian expense patterns for immediate productivity
* Users can edit or manage these in the **Configuração** (Setup) page

---

### 2️⃣ Budget Creation

Once categories are ready, users move to their **Budget** view:

* Select a **Year** (e.g., 2026).
* For each **Month**, set:

  * **Budgeted Spending** per Group or Subgroup
  * **Forecasted Income** per Earning Source
  * **Mark as Recurrent** for regular monthly expenses/income

💡 **Ease-of-Use Additions:**

* **Budget Modes (dropdown)**: Único, Recorrente, or Parcelado for each line item
  - **Recurrent Budgets**: Auto-copy to all future months (e.g., rent, utilities, salary)
  - **Installment Budgets**: Auto-copy for N months (e.g., 12-month planned expense)
* **Collapsible Categories**: Click ▶ to expand and see subcategories
* **Subcategory-Only Budgeting**: Main categories show totals only; budgets set at subcategory level
* **Cash Register Input**: Type digits to add cents (e.g., "1234" → "R$ 12,34")
  - First digits go into cents, backspace removes digits
  - Always displays in Brazilian format (R$ X,XX)
  - No input lag - saves only when you tab out
* **Always-Visible Delete Button (✕)**: Remove budgets instantly
  - Deleting recurring/installment budgets:
    - Converts all past months to "unique" (preserves history)
    - Creates missing past months retroactively as "unique"
    - Deletes current and all future months
* All budgets are editable anytime — no confirmations needed

---

### 3️⃣ Daily Use (Logging Transactions)

This is the most frequent and crucial user interaction. It must feel **instant and delightful**.

A visible **“Quick Add”** button opens a minimal modal:

#### ➕ If “Earning”:

* **Value** (required)
* **Date** (defaults to *Today*)
* **Source** (required, dropdown)
* *(Optional)* **Note**

#### ➖ If “Expense”:

* **Value** (required)
* **Date** (defaults to *Today*)
* **Group** (required)
* **Subgroup** (optional, defaults to “Other”)
* **Payment Type** (optional, defaults to “Credit Card”)
* **Installments** (optional, defaults to 1)
* *(Optional)* **Note**

**Transaction Modes:**
* **Único (Single)**: One-time transaction logged as-is
* **Parcelado (Installments)**: Divides value across N months (e.g., R$900 ÷ 3 = R$300/month)

*Note: Recurring transactions are not supported, as transactions represent historical events, not plans.*

**Installment Logic:**
If installments > 1, automatically create multiple future-dated entries splitting the total value evenly.
Example:
`R$900 over 3 installments → R$300 each for Jan 15, Feb 15, Mar 15`.

💡 **Ease-of-Use Additions:**

* "Add Another" button after each entry for fast consecutive logging.
* Smart defaults remember last used group/source.
* Installment transactions show a simple badge like **"3x 💳"** in transaction lists.

---

### 4️⃣ Review & Compare (Dashboard)

The dashboard is the product’s heart — the *payoff moment* for the user.

#### It should instantly answer:

* “How am I doing this month?”
* “Am I within my budget?”
* “How much did I save?”

**Dashboard Contents:**

* **Month Selector** (defaults to current month)
* **Income:** Forecasted vs. Actual (`R$ 4,500 / R$ 5,000 earned`)
* **Expenses:** Budgeted vs. Actual, by Group/Subgroup (`Home: R$ 1,500 / R$ 2,000 spent`)
* **Net Result:** `Income – Expenses = Savings or Deficit`

💡 **Ease-of-Use Additions:**

* One-tap switch between **Month** and **Year-to-Date** views.
* Simple bar or donut charts for quick visual understanding.
* Prominent “You’re on track!” or “Over budget” summary messages.
* Large, clean typography — numbers should feel satisfying to read.

---

## 6. Data, Storage, & Durability

* **Local-First Auto-Save:**
  All changes are instantly saved in the browser’s local storage (`IndexedDB`).

* **Manual Backup (“Save”):**
  Users can export all data into a `.json` file (e.g., `my-finances.json`).
  This file is **their** data — they can store it wherever they wish.

* **Restore (“Import”):**
  Users can import a backup to restore their full history.
  This action replaces the current local data.

💡 **Ease-of-Use Additions:**

* Show a small “Last Backup: X days ago” reminder.
* Backup file includes a schema version (`"version": "1.0"`) for future-proofing.
* Optional partial exports (by month or by type: budgets, transactions).

---

## 7. Tone & Experience Guidelines

* The app should **feel like a calm, friendly assistant**, not accounting software.
* Use warm, neutral colors, rounded elements, and light animations.
* Every view should load instantly, with clear focus on the **next action** (e.g., “Add Transaction” or “View Budget”).
* The user should *never* feel lost or punished for exploring — always reversible actions.

---

## 8. Default Brazilian Expense Categories

To help users get started quickly, the app can offer these common Brazilian expense categories during setup:

### Main Categories & Subcategories:

1. **Moradia (Housing)**
   - Aluguel
   - Condomínio
   - IPTU
   - Energia
   - Água
   - Gás
   - Internet/TV
   - Manutenção

2. **Transporte (Transportation)**
   - Combustível
   - Manutenção do veículo
   - Estacionamento
   - Transporte público
   - Pedágios
   - IPVA/Seguro

3. **Alimentação (Food)**
   - Supermercado
   - Restaurantes
   - Delivery
   - Lanche

4. **Saúde (Health)**
   - Plano de saúde
   - Medicamentos
   - Consultas médicas
   - Academia

5. **Educação (Education)**
   - Mensalidade escolar
   - Cursos
   - Livros e materiais
   - Idiomas

6. **Lazer (Leisure)**
   - Streaming (Netflix, Spotify, etc.)
   - Cinema/Shows
   - Viagens
   - Hobbies

7. **Vestuário (Clothing)**
   - Roupas
   - Calçados
   - Acessórios

8. **Despesas Pessoais (Personal Expenses)**
   - Cabeleireiro/Barbeiro
   - Produtos de higiene
   - Cosméticos

9. **Outros (Other)**
   - Presentes
   - Doações
   - Imprevistos

### Default Income Sources:
- Salário
- Freelance
- Investimentos
- Outros

---

## 9. Future Ideas (Not in MVP)

* Export to CSV or Excel
* Charts of trends over time
* Light/Dark themes
* Multiple profiles (e.g., personal vs shared)
* Rollover budgeting (carry unused money forward)
