import { FileText, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/format'

const CHALLENGES = [
  {
    id: 'chl-001',
    title: 'Community water quality monitoring system',
    state: 'scoped',
    domains: ['Water', 'IoT', 'Public health'],
    district: 'Ranchi',
    claimWindowEnds: '2026-09-01T00:00:00Z',
    matchedInstitutions: 4,
  },
  {
    id: 'chl-002',
    title: 'Tribal language learning platform',
    state: 'claimed',
    domains: ['Education', 'Language'],
    district: 'Dumka',
    claimWindowEnds: null,
    matchedInstitutions: 3,
  },
  {
    id: 'chl-003',
    title: 'Waste segregation at ward level',
    state: 'in_project',
    domains: ['Sanitation', 'Community'],
    district: 'Bokaro',
    claimWindowEnds: null,
    matchedInstitutions: 2,
  },
]

const columns = [
  { key: 'title', header: 'Challenge' },
  {
    key: 'state',
    header: 'State',
    render: (row) => <StateBadge state={row.state} />,
  },
  {
    key: 'domains',
    header: 'Domains',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.domains.map((d) => (
          <Badge key={d} variant="secondary">{d}</Badge>
        ))}
      </div>
    ),
  },
  { key: 'district', header: 'District' },
  {
    key: 'matchedInstitutions',
    header: 'Matched HEIs',
    render: (row) => <span className="font-mono">{row.matchedInstitutions}</span>,
  },
  {
    key: 'claimWindowEnds',
    header: 'Claim window',
    render: (row) =>
      row.claimWindowEnds ? formatDateTime(row.claimWindowEnds) : '—',
  },
]

export function ChallengesPage() {
  return (
    <div>
      <PageHeader
        title="Challenges"
        description="Scoped problem statements ready for institutional claim and multidisciplinary team formation."
        actions={
          <Button>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Scope challenge
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Active challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={CHALLENGES}
            emptyIcon={FileText}
            emptyTitle="No challenges yet"
            emptyDescription="Triaged submissions become challenges after scoping."
          />
        </CardContent>
      </Card>
    </div>
  )
}
