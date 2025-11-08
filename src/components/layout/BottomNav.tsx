import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
  ariaLabel: string
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: '📊',
    ariaLabel: 'Ir para Dashboard'
  },
  {
    path: '/budget',
    label: 'Orçamento',
    icon: '💰',
    ariaLabel: 'Ir para Orçamento'
  },
  {
    path: '/transactions',
    label: 'Transações',
    icon: '📝',
    ariaLabel: 'Ir para Transações'
  },
  {
    path: '/setup',
    label: 'Config',
    icon: '⚙️',
    ariaLabel: 'Ir para Configuração'
  }
]

export const BottomNav: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 safe-area-bottom"
      role="navigation"
      aria-label="Navegação principal móvel"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 py-1 rounded-lg transition-all duration-200 ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-600 active:bg-gray-100'
              }`}
              aria-label={item.ariaLabel}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon */}
              <span
                className={`text-2xl mb-0.5 transition-transform duration-200 ${
                  active ? 'scale-110' : ''
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  active ? 'text-primary-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {active && (
                <div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-t-full"
                  aria-hidden="true"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
