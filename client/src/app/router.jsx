import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SubmissionsPage } from '@/pages/submissions/SubmissionsPage'
import { TriagePage } from '@/pages/triage/TriagePage'
import { ChallengesPage } from '@/pages/challenges/ChallengesPage'
import { ClaimsPage } from '@/pages/claims/ClaimsPage'
import { TeamsPage } from '@/pages/teams/TeamsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { WorkflowPage } from '@/pages/workflow/WorkflowPage'
import { OrganizationsPage } from '@/pages/organizations/OrganizationsPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { ValidationPage } from '@/pages/validation/ValidationPage'
import { DisputesPage } from '@/pages/disputes/DisputesPage'
import { SubmitPage } from '@/pages/public/SubmitPage'
import { TrackPage } from '@/pages/public/TrackPage'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/app/guards/RequireAuth'

export const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/submit', element: <SubmitPage /> },
  { path: '/track/:trackingId', element: <TrackPage /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'submissions', element: <SubmissionsPage /> },
      { path: 'triage', element: <TriagePage /> },
      { path: 'challenges', element: <ChallengesPage /> },
      { path: 'claims', element: <ClaimsPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'workflow', element: <WorkflowPage /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'validation', element: <ValidationPage /> },
      { path: 'disputes', element: <DisputesPage /> },
    ],
  },
]
