export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
    session: ['auth', 'session'],
  },
  submissions: {
    all: ['submissions'],
    list: (filters) => ['submissions', 'list', filters],
    detail: (id) => ['submissions', 'detail', id],
  },
  triage: {
    queue: (filters) => ['triage', 'queue', filters],
    detail: (id) => ['triage', 'detail', id],
  },
  challenges: {
    all: ['challenges'],
    list: (filters) => ['challenges', 'list', filters],
    detail: (id) => ['challenges', 'detail', id],
  },
  claims: {
    list: (filters) => ['claims', 'list', filters],
    detail: (id) => ['claims', 'detail', id],
  },
  teams: {
    list: (filters) => ['teams', 'list', filters],
    detail: (id) => ['teams', 'detail', id],
  },
  projects: {
    list: (filters) => ['projects', 'list', filters],
    detail: (id) => ['projects', 'detail', id],
  },
  workflow: {
    states: (challengeId) => ['workflow', 'states', challengeId],
    events: (challengeId) => ['workflow', 'events', challengeId],
  },
  organizations: {
    all: ['organizations'],
    list: (filters) => ['organizations', 'list', filters],
    detail: (id) => ['organizations', 'detail', id],
  },
  analytics: {
    overview: (filters) => ['analytics', 'overview', filters],
    trends: (filters) => ['analytics', 'trends', filters],
  },
  validation: {
    queue: (filters) => ['validation', 'queue', filters],
    detail: (id) => ['validation', 'detail', id],
  },
  disputes: {
    list: (filters) => ['disputes', 'list', filters],
    detail: (id) => ['disputes', 'detail', id],
  },
}
