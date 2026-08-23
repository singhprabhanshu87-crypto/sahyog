import { cn } from '@/lib/cn'

export function PageHeader({
  title,
  description,
  actions,
  className,
  children,
}) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-display">{title}</h1>
          {description && (
            <p className="text-body text-text-secondary max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
