import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mic, Send } from 'lucide-react'
import { AuthShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { createSubmission } from '@/features/submission/api/submission.api'
import { formatTrackingId } from '@/lib/format'

export function SubmitPage() {
  const [text, setText] = useState('')
  const [lat, setLat] = useState('23.35')
  const [lng, setLng] = useState('85.33')
  const [consent, setConsent] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Please describe the problem')
      return
    }

    setLoading(true)
    try {
      const res = await createSubmission({
        text: text.trim(),
        locale: 'hi',
        location: { lat: Number(lat), lng: Number(lng) },
        consentGiven: true,
      })
      setResult(res.data)
      toast.success('Submission received')
    } catch (err) {
      toast.error(err.message ?? 'Could not submit')
    } finally {
      setLoading(false)
    }
  }

  if (result?.trackingId) {
    return (
      <AuthShell>
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Your tracking ID</CardTitle>
            <CardDescription>Save this number to check status later</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="font-mono text-display text-primary">
              {formatTrackingId(result.trackingId)}
            </p>
            <p className="text-body text-text-secondary">
              We received your report. No categories needed — our team will review it.
            </p>
            <div className="flex gap-2 justify-center">
              <Link to={`/track/${result.trackingId}`}>
                <Button>Track status</Button>
              </Link>
              <Button variant="secondary" onClick={() => { setResult(null); setText('') }}>
                Submit another
              </Button>
              <Link to="/">
                <Button variant="secondary">Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Report a problem</CardTitle>
          <CardDescription>
            Say what is wrong in your own words. No dropdowns, no categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">What is the problem?</Label>
              <Textarea
                id="text"
                rows={4}
                placeholder="Paani nahi aa raha — handpump broken near our school"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} />
              </div>
            </div>

            <label className="flex items-start gap-2 text-small text-text-secondary">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              I am willing to be contacted as a community validator later
            </label>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !consent} className="flex-1">
                <Send className="h-4 w-4" strokeWidth={1.5} />
                {loading ? 'Submitting…' : 'Submit report'}
              </Button>
              <Button type="button" variant="secondary" disabled title="Voice upload in next iteration">
                <Mic className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>

            <p className="flex items-center gap-1 text-small text-text-secondary">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              Public view will show panchayat-level location only
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
