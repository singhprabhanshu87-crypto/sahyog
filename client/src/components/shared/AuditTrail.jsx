import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export function AuditTrail({ events = [], className }) {
  if (!events.length) {
    return (
      <p className="text-body text-text-secondary">No activity recorded yet.</p>
    )
  }

  return (
    <ol className={cn('space-y-4', className)}>
      {events.map((event, index) => (
        <li key={event.id ?? index} className="relative flex gap-3 pl-6">
          <span
            className={cn(
              'absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary',
              index < events.length - 1 &&
                'before:absolute before:left-[3px] before:top-3 before:h-[calc(100%+12px)] before:w-px before:bg-border',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-subheading text-text-primary">
                {event.action}
              </span>
              <span className="text-small text-text-secondary">
                {formatDateTime(event.timestamp)}
              </span>
            </div>
            {event.actor && (
              <p className="text-small text-text-secondary">by {event.actor}</p>
            )}
            {event.detail && (
              <p className="mt-1 text-body text-text-secondary">{event.detail}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
