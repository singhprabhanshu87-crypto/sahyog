import { ClipboardCheck, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ConfidenceChip } from '@/components/shared/ConfidenceChip'
import { StateBadge } from '@/components/shared/StateBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const TRIAGE_QUEUE = [
  {
    id: 'trg-001',
    summary: 'Handpump failure — Kanke block',
    classification: 'Innovation',
    confidence: 0.72,
    domains: ['Water', 'Infrastructure'],
    duplicateCluster: 12,
    district: 'Ranchi',
    submittedAt: '2026-08-20T09:15:00Z',
    state: 'pending',
  },
  {
    id: 'trg-002',
    summary: 'Road pothole complaint near market',
    classification: 'Grievance',
    confidence: 0.91,
    domains: ['Transport'],
    duplicateCluster: 1,
    district: 'Jamshedpur',
    submittedAt: '2026-08-19T16:00:00Z',
    state: 'pending',
  },
  {
    id: 'trg-003',
    summary: 'Digital literacy centre for tribal youth',
    classification: 'Innovation',
    confidence: 0.45,
    domains: ['Education', 'Technology'],
    duplicateCluster: 0,
    district: 'Dumka',
    submittedAt: '2026-08-19T10:30:00Z',
    state: 'pending',
  },
]

const columns = [
  { key: 'summary', header: 'Submission' },
  {
    key: 'classification',
    header: 'Proposed type',
    render: (row) => (
      <Badge variant={row.classification === 'Grievance' ? 'danger' : 'default'}>
        {row.classification}
      </Badge>
    ),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    render: (row) => <ConfidenceChip value={row.confidence} />,
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
  {
    key: 'duplicateCluster',
    header: 'Cluster size',
    render: (row) => (
      <span className="font-mono">{row.duplicateCluster || '—'}</span>
    ),
  },
  { key: 'district', header: 'District' },
  {
    key: 'state',
    header: 'Status',
    render: (row) => <StateBadge state={row.state} />,
  },
]

export function TriagePage() {
  return (
    <div>
      <PageHeader
        title="Triage"
        description="Separate grievance redressal from innovation challenges. Human review below confidence threshold."
        actions={
          <Button variant="secondary">
            <Filter className="h-4 w-4" strokeWidth={1.5} />
            Filters
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select className="w-40" defaultValue="all">
          <option value="all">All districts</option>
          <option value="ranchi">Ranchi</option>
          <option value="dhanbad">Dhanbad</option>
        </Select>
        <Select className="w-40" defaultValue="pending">
          <option value="pending">Pending review</option>
          <option value="low-confidence">Low confidence</option>
          <option value="grievance">Grievance candidates</option>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Review queue</CardTitle>
          <span className="text-small text-text-secondary">
            {TRIAGE_QUEUE.length} items awaiting review
          </span>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={TRIAGE_QUEUE}
            emptyIcon={ClipboardCheck}
            emptyTitle="Triage queue is empty"
            emptyDescription="New submissions will appear here for classification review."
          />
        </CardContent>
      </Card>
    </div>
  )
}
