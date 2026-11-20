import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AuthShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StateBadge } from '@/components/shared/StateBadge'
import { trackSubmission } from '@/features/submission/api/submission.api'
import { formatDateTime, formatTrackingId } from '@/lib/format'

export function TrackPage() {
  const { trackingId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trackingId) return
    trackSubmission(trackingId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [trackingId])

  return (
    <AuthShell>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Track your report</CardTitle>
          <CardDescription>
            Tracking ID: <span className="font-mono text-primary">{formatTrackingId(trackingId)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-danger-subtle p-4 text-danger text-body">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StateBadge state={data.status ?? data.workflowState ?? 'submitted'} />
                <span className="text-small text-text-secondary">
                  {formatDateTime(data.submittedAt ?? data.createdAt)}
                </span>
              </div>
              <p className="text-body text-text-primary">
                {data.statusMessage ?? data.summary ?? 'Your report is being reviewed by our team.'}
              </p>
              {data.location?.district && (
                <p className="text-small text-text-secondary">
                  Area: {data.location.district}
                  {data.location.block ? ` · ${data.location.block}` : ''}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
