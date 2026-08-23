import { Handshake, Timer } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from '@/lib/format'

const CLAIMS = [
  {
    id: 'clm-001',
    challenge: 'Community water quality monitoring',
    institution: 'BIT Mesra',
    nodalPI: 'Dr. Anil Verma',
    status: 'pending',
    expiresAt: '2026-08-26T00:00:00Z',
    coiDeclared: true,
  },
  {
    id: 'clm-002',
    challenge: 'Solar micro-grid for remote hamlet',
    institution: 'IIT ISM Dhanbad',
    nodalPI: 'Prof. Meera Singh',
    status: 'approved',
    expiresAt: null,
    coiDeclared: true,
  },
  {
    id: 'clm-003',
    challenge: 'Waste segregation pilot',
    institution: 'Ranchi University',
    nodalPI: 'Dr. Rajesh Kumar',
    status: 'rejected',
    expiresAt: null,
    coiDeclared: false,
  },
]

const columns = [
  { key: 'challenge', header: 'Challenge' },
  { key: 'institution', header: 'Institution' },
  { key: 'nodalPI', header: 'Nodal PI' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StateBadge state={row.status} />,
  },
  {
    key: 'coiDeclared',
    header: 'COI',
    render: (row) => (
      <Badge variant={row.coiDeclared ? 'success' : 'danger'}>
        {row.coiDeclared ? 'Clear' : 'Conflict'}
      </Badge>
    ),
  },
  {
    key: 'expiresAt',
    header: 'Expires',
    render: (row) =>
      row.expiresAt ? (
        <span className="text-warning">{formatRelative(row.expiresAt)}</span>
      ) : (
        '—'
      ),
  },
]

export function ClaimsPage() {
  return (
    <div>
      <PageHeader
        title="Claims"
        description="Institutional claim windows with exclusivity locks and conflict-of-interest checks."
        actions={
          <Button variant="secondary">
            <Timer className="h-4 w-4" strokeWidth={1.5} />
            Expiring soon
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Claim activity</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={CLAIMS}
            emptyIcon={Handshake}
            emptyTitle="No claims yet"
            emptyDescription="HEIs can claim challenges during the open claim window."
          />
        </CardContent>
      </Card>
    </div>
  )
}
