import { GitBranch, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { AuditTrail } from '@/components/shared/AuditTrail'
import { StateBadge } from '@/components/shared/StateBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const WORKFLOW_STATES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'triaged', label: 'Triaged' },
  { key: 'scoped', label: 'Scoped' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'in_project', label: 'In project' },
  { key: 'validated', label: 'Validated' },
  { key: 'closed', label: 'Closed' },
]

const DEMO_EVENTS = [
  {
    id: 1,
    action: 'State changed to Scoped',
    actor: 'Domain Officer — Ranchi',
    timestamp: '2026-08-18T10:00:00Z',
    detail: 'Problem brief published with success criteria.',
  },
  {
    id: 2,
    action: 'State changed to Triaged',
    actor: 'Reviewer — PMU',
    timestamp: '2026-08-17T14:30:00Z',
    detail: 'Classified as innovation challenge. Attached to duplicate cluster (12 reports).',
  },
  {
    id: 3,
    action: 'Submission received',
    actor: 'Citizen via voice',
    timestamp: '2026-08-15T09:15:00Z',
    detail: 'Tracking ID JH-2026-0047 issued.',
  },
]

export function WorkflowPage() {
  const currentState = 'scoped'
  const currentIndex = WORKFLOW_STATES.findIndex((s) => s.key === currentState)

  return (
    <div>
      <PageHeader
        title="Workflow"
        description="Governance state machine — auditable, SLA-bound, append-only event log."
        actions={
          <Select className="w-64" defaultValue="chl-001">
            <option value="chl-001">Water quality monitoring — JH-2026-0047</option>
            <option value="chl-002">Tribal language app — JH-2026-0038</option>
          </Select>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Challenge lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW_STATES.map((state, index) => (
              <div key={state.key} className="flex items-center gap-2">
                <div
                  className={
                    index <= currentIndex
                      ? 'opacity-100'
                      : 'opacity-40'
                  }
                >
                  <StateBadge state={state.key} />
                </div>
                {index < WORKFLOW_STATES.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button>Advance to Claimed</Button>
            <Button variant="secondary">Request scoping revision</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <GitBranch className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
          <CardTitle>Audit trail</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrail events={DEMO_EVENTS} />
        </CardContent>
      </Card>
    </div>
  )
}
