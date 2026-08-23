import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-small font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-subtle text-primary',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-danger',
        secondary: 'bg-surface-overlay text-text-secondary',
        outline: 'border border-border text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
