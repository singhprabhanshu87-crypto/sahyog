import { cn } from '@/lib/cn'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-overlay',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
