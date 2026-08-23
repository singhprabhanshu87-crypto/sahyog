import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Mic, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatTrackingId } from '@/lib/format'
import { listSubmissions } from '@/features/submission/api/submission.api'
import { queryKeys } from '@/lib/query-keys'

const columns = [
  {
    key: 'trackingId',
    header: 'Tracking ID',
    render: (row) => (
      <span className="font-mono text-primary">{formatTrackingId(row.trackingId)}</span>
    ),
  },
  { key: 'summary', header: 'Summary', render: (row) => row.summary ?? row.text?.slice(0, 80) },
  { key: 'district', header: 'District', render: (row) => row.location?.district ?? row.district ?? '—' },
  { key: 'inputMode', header: 'Channel', render: (row) => row.inputMode ?? row.channel ?? 'Text' },
  {
    key: 'submittedAt',
    header: 'Submitted',
    render: (row) => formatDateTime(row.submittedAt ?? row.createdAt),
  },
  {
    key: 'state',
    header: 'Status',
    render: (row) => <StateBadge state={row.status ?? row.workflowState ?? 'submitted'} />,
  },
]

export function SubmissionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.submissions.list({}),
    queryFn: () => listSubmissions(),
  })

  const rows = data?.data ?? data?.items ?? []

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Citizen and facilitator intake — voice-first, multilingual, no taxonomy dropdowns."
        actions={
          <>
            <Link to="/submit">
              <Button>
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                New submission
              </Button>
            </Link>
            <Button variant="secondary" disabled title="Voice upload coming soon">
              <Mic className="h-4 w-4" strokeWidth={1.5} />
              Voice intake
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-md bg-danger-subtle p-3 text-danger text-body">
          {error.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            emptyIcon={Inbox}
            emptyTitle="No submissions yet"
            emptyDescription="Citizen reports will appear here with tracking IDs."
          />
        </CardContent>
      </Card>
    </div>
  )
}
