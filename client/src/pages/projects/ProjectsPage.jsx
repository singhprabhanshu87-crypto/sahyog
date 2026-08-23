import { FolderKanban, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/format'

const PROJECTS = [
  {
    id: 'prj-001',
    title: 'Water quality IoT pilot — Kanke',
    challenge: 'Community water quality monitoring',
    milestone: 'Prototype deployment',
    progress: 65,
    dueDate: '2026-09-15T00:00:00Z',
    state: 'in_project',
  },
  {
    id: 'prj-002',
    title: 'Santali literacy app MVP',
    challenge: 'Tribal language learning platform',
    milestone: 'User testing',
    progress: 40,
    dueDate: '2026-10-01T00:00:00Z',
    state: 'in_project',
  },
]

const columns = [
  { key: 'title', header: 'Project' },
  { key: 'challenge', header: 'Challenge' },
  { key: 'milestone', header: 'Current milestone' },
  {
    key: 'progress',
    header: 'Progress',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-20 rounded-sm bg-surface-overlay overflow-hidden">
          <div
            className="h-full bg-primary rounded-sm"
            style={{ width: `${row.progress}%` }}
          />
        </div>
        <span className="font-mono text-small">{row.progress}%</span>
      </div>
    ),
  },
  {
    key: 'dueDate',
    header: 'Due',
    render: (row) => formatDateTime(row.dueDate),
  },
  {
    key: 'state',
    header: 'Status',
    render: (row) => <StateBadge state={row.state} />,
  },
]

export function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Light project boards with evidence upload at gates — not activity surveillance."
        actions={
          <Button variant="secondary">
            <Upload className="h-4 w-4" strokeWidth={1.5} />
            Upload evidence
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Active projects</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={PROJECTS}
            emptyIcon={FolderKanban}
            emptyTitle="No active projects"
            emptyDescription="Projects begin when a challenge moves to in-project state."
          />
        </CardContent>
      </Card>
    </div>
  )
}
