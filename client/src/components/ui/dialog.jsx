import { createContext, useContext, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

const DialogContext = createContext(null)

function Dialog({ open, onOpenChange, children }) {
  const [isOpen, setIsOpen] = useState(open ?? false)

  useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  const handleChange = (value) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ asChild, children, ...props }) {
  const ctx = useContext(DialogContext)
  if (asChild) {
    return (
      <span onClick={() => ctx?.onOpenChange(true)} {...props}>
        {children}
      </span>
    )
  }
  return (
    <button type="button" onClick={() => ctx?.onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

function DialogContent({ className, children, title, description }) {
  const ctx = useContext(DialogContext)
  if (!ctx?.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-text-primary/40"
        onClick={() => ctx.onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className={cn(
          'relative z-50 w-full max-w-[480px] rounded-lg border border-border bg-surface p-6 shadow-modal',
          className,
        )}
      >
        <button
          type="button"
          onClick={() => ctx.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
        {title && (
          <h2 id="dialog-title" className="text-heading pr-8">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1 text-body text-text-secondary">{description}</p>
        )}
        <div className={cn(title || description ? 'mt-4' : '')}>{children}</div>
      </div>
    </div>
  )
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogFooter }
