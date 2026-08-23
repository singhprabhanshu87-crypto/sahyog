import { Users, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TEAMS = [
  {
    id: 'team-001',
    challenge: 'Water quality monitoring system',
    accountableInstitution: 'BIT Mesra',
    nodalPI: 'Dr. Anil Verma',
    members: 8,
    disciplines: ['Civil', 'IoT', 'Public health'],
    industryMentor: 'AquaTech Pvt Ltd',
  },
  {
    id: 'team-002',
    challenge: 'Tribal language learning platform',
    accountableInstitution: 'Ranchi University',
    nodalPI: 'Prof. Sunita Devi',
    members: 12,
    disciplines: ['Linguistics', 'CS', 'Education'],
    industryMentor: null,
  },
]

const columns = [
  { key: 'challenge', header: 'Challenge' },
  { key: 'accountableInstitution', header: 'Accountable institution' },
  { key: 'nodalPI', header: 'Nodal PI' },
  {
    key: 'members',
    header: 'Members',
    render: (row) => <span className="font-mono">{row.members}</span>,
  },
  {
    key: 'disciplines',
    header: 'Disciplines',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.disciplines.map((d) => (
          <Badge key={d} variant="secondary">{d}</Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'industryMentor',
    header: 'Industry mentor',
    render: (row) => row.industryMentor ?? '—',
  },
]

export function TeamsPage() {
  return (
    <div>
      <PageHeader
        title="Teams"
        description="Multidisciplinary teams with single accountable institution and named nodal PI."
        actions={
          <Button>
            <UserPlus className="h-4 w-4" strokeWidth={1.5} />
            Form team
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Active teams</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={TEAMS}
            emptyIcon={Users}
            emptyTitle="No teams formed"
            emptyDescription="Teams are created after a challenge is claimed."
          />
        </CardContent>
      </Card>
    </div>
  )
}
