/**
 * Input Sanitization Utilities
 *
 * Utilities for sanitizing user input to prevent XSS attacks and ensure data safety.
 * Uses DOMPurify to clean HTML and potentially malicious content from text inputs.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitizes a string by removing HTML tags and potentially malicious content
 *
 * @param input - The string to sanitize
 * @returns Sanitized string safe for storage and display
 *
 * @example
 * sanitizeText('<script>alert("xss")</script>Hello') // Returns: 'Hello'
 * sanitizeText('Normal text') // Returns: 'Normal text'
 */
export const sanitizeText = (input: string): string => {
  if (!input) return ''

  // Configure DOMPurify to strip all HTML tags and only return text
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep the text content
  })

  // Trim whitespace
  return sanitized.trim()
}

/**
 * Sanitizes HTML content while allowing safe tags
 *
 * @param input - The HTML string to sanitize
 * @param allowedTags - Array of allowed HTML tags (default: basic formatting tags)
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * sanitizeHTML('<p>Safe <script>alert("xss")</script></p>')
 * // Returns: '<p>Safe </p>'
 */
export const sanitizeHTML = (
  input: string,
  allowedTags: string[] = ['p', 'br', 'strong', 'em', 'u']
): string => {
  if (!input) return ''

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: [],
  })
}

/**
 * Validates and sanitizes a number input string
 *
 * @param input - The number string to sanitize
 * @param options - Validation options
 * @returns Sanitized number or null if invalid
 *
 * @example
 * sanitizeNumber('123.45') // Returns: 123.45
 * sanitizeNumber('abc') // Returns: null
 * sanitizeNumber('-5', { allowNegative: false }) // Returns: null
 */
export const sanitizeNumber = (
  input: string,
  options: {
    allowNegative?: boolean
    allowDecimals?: boolean
    min?: number
    max?: number
  } = {}
): number | null => {
  const { allowNegative = false, allowDecimals = true, min, max } = options

  // Remove non-numeric characters except . and -
  let cleaned = input.replace(/[^\d.-]/g, '')

  // Parse as number
  const parsed = allowDecimals ? parseFloat(cleaned) : parseInt(cleaned, 10)

  // Validate
  if (isNaN(parsed)) return null
  if (!allowNegative && parsed < 0) return null
  if (min !== undefined && parsed < min) return null
  if (max !== undefined && parsed > max) return null

  return parsed
}

/**
 * Sanitizes a date string to ensure it's in valid format
 *
 * @param input - The date string to sanitize
 * @returns Sanitized date string in YYYY-MM-DD format or null if invalid
 *
 * @example
 * sanitizeDate('2025-01-15') // Returns: '2025-01-15'
 * sanitizeDate('invalid') // Returns: null
 */
export const sanitizeDate = (input: string): string | null => {
  if (!input) return null

  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null

  // Validate the date is real
  const date = new Date(input)
  if (isNaN(date.getTime())) return null

  return input
}

/**
 * Escapes special characters in a string for safe regex usage
 *
 * @param input - The string to escape
 * @returns Escaped string safe for regex
 *
 * @example
 * escapeRegex('hello (world)') // Returns: 'hello \\(world\\)'
 */
export const escapeRegex = (input: string): string => {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Truncates a string to a maximum length and adds ellipsis
 *
 * @param input - The string to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated string
 *
 * @example
 * truncateString('This is a very long text', 10) // Returns: 'This is a...'
 */
export const truncateString = (input: string, maxLength: number = 100): string => {
  if (!input || input.length <= maxLength) return input
  return input.substring(0, maxLength - 3) + '...'
}
