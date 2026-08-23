import { cn } from '@/lib/cn'

const STATE_STYLES = {
  submitted: { variant: 'secondary', label: 'Submitted' },
  triaged: { variant: 'default', label: 'Triaged' },
  scoped: { variant: 'default', label: 'Scoped' },
  claimed: { variant: 'warning', label: 'Claimed' },
  in_project: { variant: 'default', label: 'In project' },
  validated: { variant: 'success', label: 'Validated' },
  closed: { variant: 'secondary', label: 'Closed' },
  grievance: { variant: 'danger', label: 'Grievance' },
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },
}

const VARIANT_CLASSES = {
  default: 'bg-primary-subtle text-primary',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  secondary: 'bg-surface-overlay text-text-secondary',
}

export function StateBadge({ state, className }) {
  const config = STATE_STYLES[state?.toLowerCase()] ?? {
    variant: 'secondary',
    label: state ?? 'Unknown',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-small font-medium',
        VARIANT_CLASSES[config.variant],
        className,
      )}
    >
      {config.label}
    </span>
  )
}
