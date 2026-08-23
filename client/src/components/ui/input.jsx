import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-border bg-surface-overlay px-3 py-2 text-body text-text-primary placeholder:text-text-secondary transition-colors',
      'focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-primary/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-border bg-surface-overlay px-3 py-2 text-body text-text-primary placeholder:text-text-secondary transition-colors',
      'focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-2 focus-visible:ring-primary/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-subheading text-text-primary', className)}
    {...props}
  />
))
Label.displayName = 'Label'

export { Input, Textarea, Label }
