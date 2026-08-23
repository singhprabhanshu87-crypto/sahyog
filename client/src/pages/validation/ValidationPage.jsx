import { Scale, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'

const VALIDATION_QUEUE = [
  {
    id: 'val-001',
    project: 'Water quality IoT pilot',
    milestone: 'Prototype deployment',
    submittedBy: 'Dr. Anil Verma',
    submittedAt: '2026-08-22T11:00:00Z',
    communityValidator: 'Ram Singh (Kanke)',
    state: 'pending',
  },
  {
    id: 'val-002',
    project: 'Santali literacy app MVP',
    milestone: 'User testing complete',
    submittedBy: 'Prof. Sunita Devi',
    submittedAt: '2026-08-21T09:30:00Z',
    communityValidator: 'Mangal Murmu (Dumka)',
    state: 'pending',
  },
  {
    id: 'val-003',
    project: 'Waste segregation pilot',
    milestone: 'Final report',
    submittedBy: 'Dr. Rajesh Kumar',
    submittedAt: '2026-08-15T16:00:00Z',
    communityValidator: 'Sita Devi (Bokaro)',
    state: 'approved',
  },
]

const columns = [
  { key: 'project', header: 'Project' },
  { key: 'milestone', header: 'Milestone' },
  { key: 'submittedBy', header: 'Submitted by' },
  {
    key: 'submittedAt',
    header: 'Submitted',
    render: (row) => formatDateTime(row.submittedAt),
  },
  { key: 'communityValidator', header: 'Community validator' },
  {
    key: 'state',
    header: 'Status',
    render: (row) => <StateBadge state={row.state} />,
  },
]

export function ValidationPage() {
  return (
    <div>
      <PageHeader
        title="Validation"
        description="Community sign-off on milestones — not just working prototypes."
        actions={
          <Button>
            <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
            Sign off milestone
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Validation queue</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={VALIDATION_QUEUE}
            emptyIcon={Scale}
            emptyTitle="No milestones awaiting validation"
            emptyDescription="Teams submit evidence at gates for community review."
          />
        </CardContent>
      </Card>
    </div>
  )
}
