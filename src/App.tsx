import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AppProvider } from '@/context/AppContext'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { QuickStartGuide, useQuickStartGuide } from '@/components/common/QuickStartGuide'
import { fileSyncService } from '@/services/fileSync'

// Lazy load all page components for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage').then(module => ({ default: module.TransactionsPage })))
const BudgetPage = lazy(() => import('@/pages/BudgetPage').then(module => ({ default: module.BudgetPage })))
const SetupPage = lazy(() => import('@/pages/SetupPage').then(module => ({ default: module.SetupPage })))

function AppContent() {
  const { shouldShow, setShouldShow } = useQuickStartGuide()

  // Initialize file sync service on app load
  useEffect(() => {
    fileSyncService.initialize().catch(error => {
      console.error('Failed to initialize file sync service:', error)
    })
  }, [])

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Navbar />
        <Suspense fallback={<div className="p-8"><LoadingState /></div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
      {shouldShow && <QuickStartGuide onClose={() => setShouldShow(false)} />}
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
