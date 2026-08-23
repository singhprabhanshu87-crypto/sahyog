import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

export function formatDate(value, pattern = 'dd MMM yyyy') {
  const date = parseDate(value)
  if (!date) return '—'
  return format(date, pattern)
}

export function formatDateTime(value) {
  return formatDate(value, 'dd MMM yyyy, HH:mm')
}

export function formatRelative(value) {
  const date = parseDate(value)
  if (!date) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatCurrency(amount, currency = 'INR') {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercent(value, decimals = 0) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

export function formatTrackingId(id) {
  if (!id) return '—'
  return String(id).toUpperCase()
}

export function truncate(text, maxLength = 80) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return isValid(value) ? value : null
  const parsed = parseISO(String(value))
  return isValid(parsed) ? parsed : null
}
