import React, { useEffect, useRef } from 'react'
import { useDeviceType } from '@/hooks/useMediaQuery'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const { isMobile } = useDeviceType()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)
      document.body.style.overflow = 'hidden'

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTabKey)
      document.body.style.overflow = 'unset'

      // Return focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`flex min-h-screen items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={modalRef}
          className={`relative bg-white shadow-xl w-full overflow-y-auto ${
            isMobile
              ? 'min-h-screen max-h-screen rounded-none'
              : `rounded-xl ${sizeStyles[size]} max-h-[90vh]`
          }`}
          tabIndex={-1}
        >
          <div className={`sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center ${
            isMobile ? 'px-4 py-3' : 'px-6 py-4'
          }`}>
            <h3 id="modal-title" className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 transition-colors ${
                isMobile ? 'p-2 -mr-2' : ''
              }`}
              aria-label="Fechar modal"
            >
              <svg className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={isMobile ? 'px-4 py-4 pb-20' : 'px-6 py-4'}>{children}</div>
        </div>
      </div>
    </div>
  )
}
