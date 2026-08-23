import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogIn, Mail } from 'lucide-react'
import { AuthShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/auth.store'
import { requestOtp, verifyOtp } from '@/features/auth/api/auth.api'

const emailSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, 'Enter the OTP code'),
})

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [step, setStep] = useState('email')

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: 'pmu@sahyog.demo' },
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: '', code: '' },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    }
  }, [isAuthenticated, location.state, navigate])

  if (isAuthenticated) {
    return null
  }

  const onRequestOtp = async ({ email }) => {
    try {
      await requestOtp(email)
      otpForm.setValue('email', email)
      setStep('otp')
      toast.success('OTP sent — check server console in dev')
    } catch (err) {
      toast.error(err.message ?? 'Could not send OTP')
    }
  }

  const onVerifyOtp = async ({ email, code }) => {
    try {
      const result = await verifyOtp(email, code)
      login(result.user, result)
      toast.success('Signed in successfully')
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      toast.error(err.message ?? 'Invalid OTP')
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-heading font-bold">S</span>
          </div>
          <CardTitle>Sign in to Sahyog</CardTitle>
          <CardDescription>
            Jharkhand Societal Innovation Collaboration Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...emailForm.register('email')} />
                {emailForm.formState.errors.email && (
                  <p className="text-small text-danger">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                {emailForm.formState.isSubmitting ? 'Sending…' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">OTP code</Label>
                <Input id="code" inputMode="numeric" {...otpForm.register('code')} />
                {otpForm.formState.errors.code && (
                  <p className="text-small text-danger">{otpForm.formState.errors.code.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
                <LogIn className="h-4 w-4" strokeWidth={1.5} />
                {otpForm.formState.isSubmitting ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('email')}>
                Use a different email
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-small text-text-secondary">
            Demo: pmu@sahyog.demo, faculty@sahyog.demo, citizen@sahyog.demo
          </p>
          <p className="mt-2 text-center text-small">
            <Link to="/submit" className="text-primary hover:underline">Citizen report (no login)</Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
