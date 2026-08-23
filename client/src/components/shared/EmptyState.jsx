import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-overlay text-text-secondary">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-heading text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-body text-text-secondary">{description}</p>
      )}
      {(action || onAction) && (
        <div className="mt-6">
          {action ?? (
            <Button onClick={onAction}>{actionLabel ?? 'Get started'}</Button>
          )}
        </div>
      )}
    </div>
  )
}
