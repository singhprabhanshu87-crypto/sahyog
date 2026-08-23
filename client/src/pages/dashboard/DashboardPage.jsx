import {
  ArrowUpRight,
  ClipboardCheck,
  FileText,
  Handshake,
  Inbox,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StateBadge } from '@/components/shared/StateBadge'
import { formatNumber, formatRelative } from '@/lib/format'

const stats = [
  { label: 'New submissions', value: 47, change: '+12%', icon: Inbox },
  { label: 'Awaiting triage', value: 23, change: '5 urgent', icon: ClipboardCheck },
  { label: 'Active challenges', value: 156, change: '+8 this week', icon: FileText },
  { label: 'Open claims', value: 34, change: '3 expiring', icon: Handshake },
]

const recentActivity = [
  { id: 1, title: 'Borewell failure in Kanke block', state: 'submitted', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, title: 'School sanitation upgrade', state: 'triaged', time: new Date(Date.now() - 7200000).toISOString() },
  { id: 3, title: 'Solar street lighting pilot', state: 'claimed', time: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, title: 'Tribal language learning app', state: 'in_project', time: new Date(Date.now() - 172800000).toISOString() },
]

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of societal innovation activity across Jharkhand."
        actions={
          <Link to="/submissions">
            <Button>New submission</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-small text-text-secondary">{stat.label}</p>
                  <p className="mt-1 font-mono text-display text-text-primary">
                    {formatNumber(stat.value)}
                  </p>
                  <p className="mt-1 text-small text-text-secondary">{stat.change}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <stat.icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Link to="/challenges">
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-surface-overlay transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-subheading text-text-primary truncate">{item.title}</p>
                  <p className="text-small text-text-secondary">{formatRelative(item.time)}</p>
                </div>
                <StateBadge state={item.state} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              { to: '/triage', label: 'Review triage queue', desc: '23 items awaiting review' },
              { to: '/claims', label: 'Manage claims', desc: '3 claims expiring soon' },
              { to: '/validation', label: 'Validation queue', desc: '8 milestones pending sign-off' },
              { to: '/analytics', label: 'View analytics', desc: 'District-wise performance' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-surface-overlay transition-colors"
              >
                <div>
                  <p className="text-subheading text-text-primary">{action.label}</p>
                  <p className="text-small text-text-secondary">{action.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
