/**
 * Form Error Component
 *
 * Displays inline form validation errors with proper accessibility attributes.
 */

import React from 'react'

interface FormErrorProps {
  error?: string
  id?: string
}

/**
 * Displays a form validation error message
 *
 * @param error - The error message to display
 * @param id - Optional ID for linking with aria-describedby
 *
 * @example
 * ```tsx
 * <Input name="email" aria-describedby="email-error" />
 * <FormError id="email-error" error={errors.email?.message} />
 * ```
 */
export const FormError: React.FC<FormErrorProps> = ({ error, id }) => {
  if (!error) return null

  return (
    <p id={id} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {error}
    </p>
  )
}
