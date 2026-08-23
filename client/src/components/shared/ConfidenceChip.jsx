import { cn } from '@/lib/cn'
import { formatPercent } from '@/lib/format'

function getConfidenceLevel(value) {
  if (value >= 0.85) return 'high'
  if (value >= 0.6) return 'medium'
  return 'low'
}

const LEVEL_STYLES = {
  high: 'bg-success-subtle text-success border-success/20',
  medium: 'bg-warning-subtle text-warning border-warning/20',
  low: 'bg-danger-subtle text-danger border-danger/20',
}

const LEVEL_LABELS = {
  high: 'High confidence',
  medium: 'Review suggested',
  low: 'Low confidence',
}

export function ConfidenceChip({ value, showPercent = true, className }) {
  const level = getConfidenceLevel(value)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-small font-medium',
        LEVEL_STYLES[level],
        className,
      )}
      title={LEVEL_LABELS[level]}
    >
      {showPercent && (
        <span className="font-mono">{formatPercent(value * 100, 0)}</span>
      )}
      <span>{LEVEL_LABELS[level]}</span>
    </span>
  )
}
