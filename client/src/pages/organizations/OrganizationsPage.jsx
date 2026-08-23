import { Building2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/format'

const ORGANIZATIONS = [
  {
    id: 'org-001',
    name: 'BIT Mesra',
    type: 'HEI',
    district: 'Ranchi',
    activeChallenges: 12,
    capabilityScore: 0.82,
    onboarded: true,
  },
  {
    id: 'org-002',
    name: 'IIT ISM Dhanbad',
    type: 'HEI',
    district: 'Dhanbad',
    activeChallenges: 18,
    capabilityScore: 0.91,
    onboarded: true,
  },
  {
    id: 'org-003',
    name: 'AquaTech Pvt Ltd',
    type: 'Industry',
    district: 'Ranchi',
    activeChallenges: 3,
    capabilityScore: 0.74,
    onboarded: true,
  },
  {
    id: 'org-004',
    name: 'Giridih District Administration',
    type: 'Government',
    district: 'Giridih',
    activeChallenges: 0,
    capabilityScore: null,
    onboarded: false,
  },
]

const columns = [
  { key: 'name', header: 'Organization' },
  {
    key: 'type',
    header: 'Type',
    render: (row) => <Badge variant="secondary">{row.type}</Badge>,
  },
  { key: 'district', header: 'District' },
  {
    key: 'activeChallenges',
    header: 'Active challenges',
    render: (row) => <span className="font-mono">{formatNumber(row.activeChallenges)}</span>,
  },
  {
    key: 'capabilityScore',
    header: 'Capability score',
    render: (row) =>
      row.capabilityScore != null ? (
        <span className="font-mono">{(row.capabilityScore * 100).toFixed(0)}%</span>
      ) : (
        '—'
      ),
  },
  {
    key: 'onboarded',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.onboarded ? 'success' : 'warning'}>
        {row.onboarded ? 'Onboarded' : 'Pending'}
      </Badge>
    ),
  },
]

export function OrganizationsPage() {
  return (
    <div>
      <PageHeader
        title="Organizations"
        description="HEIs, industry partners, government bodies, and capability profiles."
        actions={
          <Button>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Onboard organization
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={ORGANIZATIONS}
            emptyIcon={Building2}
            emptyTitle="No organizations"
            emptyDescription="Onboard HEIs and partners to enable challenge routing."
          />
        </CardContent>
      </Card>
    </div>
  )
}
