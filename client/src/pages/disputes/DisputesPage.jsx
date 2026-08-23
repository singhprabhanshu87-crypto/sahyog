import { Gavel, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/format'

const DISPUTES = [
  {
    id: 'dsp-001',
    title: 'IP ownership — water sensor firmware',
    type: 'IP & credit',
    parties: ['BIT Mesra', 'AquaTech Pvt Ltd'],
    filedAt: '2026-08-10T14:00:00Z',
    state: 'pending',
    mediator: 'State PMU',
  },
  {
    id: 'dsp-002',
    title: 'Milestone evidence dispute',
    type: 'Validation',
    parties: ['Ranchi University', 'Community validator'],
    filedAt: '2026-08-05T10:30:00Z',
    state: 'in_project',
    mediator: 'Domain Officer',
  },
]

const columns = [
  { key: 'title', header: 'Dispute' },
  {
    key: 'type',
    header: 'Type',
    render: (row) => <Badge variant="outline">{row.type}</Badge>,
  },
  {
    key: 'parties',
    header: 'Parties',
    render: (row) => row.parties.join(' vs '),
  },
  {
    key: 'filedAt',
    header: 'Filed',
    render: (row) => formatDateTime(row.filedAt),
  },
  { key: 'mediator', header: 'Mediator' },
  {
    key: 'state',
    header: 'Status',
    render: (row) => <StateBadge state={row.state} />,
  },
]

export function DisputesPage() {
  return (
    <div>
      <PageHeader
        title="Disputes"
        description="IP, credit, and validation disputes with structured mediation."
        actions={
          <Button variant="secondary">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            File dispute
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Open disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={DISPUTES}
            emptyIcon={Gavel}
            emptyTitle="No open disputes"
            emptyDescription="Disputes are filed when IP or validation conflicts arise."
          />
        </CardContent>
      </Card>
    </div>
  )
}
