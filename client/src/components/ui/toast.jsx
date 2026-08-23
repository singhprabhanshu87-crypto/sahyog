import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-md border border-border bg-surface shadow-dropdown text-text-primary text-body',
          title: 'text-subheading text-text-primary',
          description: 'text-text-secondary',
          success: 'border-success/20 bg-success-subtle text-success',
          error: 'border-danger/20 bg-danger-subtle text-danger',
          warning: 'border-warning/20 bg-warning-subtle text-warning',
        },
      }}
      closeButton
      richColors
    />
  )
}

export { toast } from 'sonner'
