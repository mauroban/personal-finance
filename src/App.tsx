import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppProvider } from '@/context/AppContext'
import { Navbar } from '@/components/layout/Navbar'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// Lazy load all page components for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage').then(module => ({ default: module.TransactionsPage })))
const BudgetPage = lazy(() => import('@/pages/BudgetPage').then(module => ({ default: module.BudgetPage })))
const SetupPage = lazy(() => import('@/pages/SetupPage').then(module => ({ default: module.SetupPage })))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Suspense fallback={<div className="p-8"><LoadingState /></div>}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/setup" element={<SetupPage />} />
              </Routes>
            </Suspense>
          </div>
        </AppProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
