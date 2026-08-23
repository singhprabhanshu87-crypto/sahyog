import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { formatNumber } from '@/lib/format'

const DISTRICT_DATA = [
  { district: 'Ranchi', submissions: 142, challenges: 38, validated: 12 },
  { district: 'Dhanbad', submissions: 98, challenges: 24, validated: 8 },
  { district: 'Bokaro', submissions: 76, challenges: 18, validated: 5 },
  { district: 'Jamshedpur', submissions: 89, challenges: 22, validated: 9 },
  { district: 'Dumka', submissions: 54, challenges: 14, validated: 3 },
]

const SUMMARY = [
  { label: 'Total submissions', value: 1247 },
  { label: 'Challenges created', value: 312 },
  { label: 'Validated outcomes', value: 67 },
  { label: 'Avg. time to scope', value: '4.2 days' },
]

export function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="District-wise performance, throughput, and outcome metrics for state PMU."
        actions={
          <Select className="w-40" defaultValue="30d">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {SUMMARY.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4">
              <p className="text-small text-text-secondary">{item.label}</p>
              <p className="font-mono text-heading text-text-primary mt-1">
                {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChart3 className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
          <CardTitle>Submissions by district</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="district"
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="submissions" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="challenges" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="validated" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
