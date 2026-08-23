import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import { requestContextMiddleware } from './common/middleware/request-context.js';
import { defaultRateLimiter } from './common/middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './common/middleware/error-handler.js';

import eventsModule, { initEventsModule } from './modules/events/events.module.js';
import authModule, { initAuthModule } from './modules/auth/auth.module.js';
import usersModule, { initUsersModule } from './modules/users/users.module.js';
import organizationsModule, { initOrganizationsModule } from './modules/organizations/organizations.module.js';
import mediaModule, { initMediaModule } from './modules/media/media.module.js';
import jobsModule, { initJobsModule } from './modules/jobs/jobs.module.js';
import taxonomyModule, { initTaxonomyModule } from './modules/taxonomy/taxonomy.module.js';
import geoModule, { initGeoModule } from './modules/geo/geo.module.js';
import languageModule, { initLanguageModule } from './modules/language/language.module.js';
import submissionsModule, { initSubmissionsModule } from './modules/submissions/submissions.module.js';
import aiModule, { initAiModule } from './modules/ai/ai.module.js';
import classificationModule, { initClassificationModule } from './modules/classification/classification.module.js';
import dedupModule, { initDedupModule } from './modules/dedup/dedup.module.js';
import clustersModule, { initClustersModule } from './modules/clusters/clusters.module.js';
import capabilityProfilesModule, { initCapabilityProfilesModule } from './modules/capability-profiles/capability-profiles.module.js';
import matchingModule, { initMatchingModule } from './modules/matching/matching.module.js';
import challengesModule, { initChallengesModule } from './modules/challenges/challenges.module.js';
import workflowModule, { initWorkflowModule } from './modules/workflow/workflow.module.js';
import claimsModule, { initClaimsModule } from './modules/claims/claims.module.js';
import teamsModule, { initTeamsModule } from './modules/teams/teams.module.js';
import agreementsModule, { initAgreementsModule } from './modules/agreements/agreements.module.js';
import projectsModule, { initProjectsModule } from './modules/projects/projects.module.js';
import milestonesModule, { initMilestonesModule } from './modules/milestones/milestones.module.js';
import validationModule, { initValidationModule } from './modules/validation/validation.module.js';
import disputesModule, { initDisputesModule } from './modules/disputes/disputes.module.js';
import notificationsModule, { initNotificationsModule } from './modules/notifications/notifications.module.js';
import analyticsModule, { initAnalyticsModule } from './modules/analytics/analytics.module.js';
import integrationsModule, { initIntegrationsModule } from './modules/integrations/integrations.module.js';

export function createApp() {
  initEventsModule();
  initAuthModule();
  initUsersModule();
  initOrganizationsModule();
  initMediaModule();
  initJobsModule();
  initTaxonomyModule();
  initGeoModule();
  initLanguageModule();
  initSubmissionsModule();
  initAiModule();
  initClassificationModule();
  initDedupModule();
  initClustersModule();
  initCapabilityProfilesModule();
  initMatchingModule();
  initChallengesModule();
  initWorkflowModule();
  initClaimsModule();
  initTeamsModule();
  initAgreementsModule();
  initProjectsModule();
  initMilestonesModule();
  initValidationModule();
  initDisputesModule();
  initNotificationsModule();
  initAnalyticsModule();
  initIntegrationsModule();

  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  app.use(defaultRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'sahyog-api', env: config.NODE_ENV });
  });

  const api = express.Router();
  api.use('/events', eventsModule());
  api.use('/auth', authModule());
  api.use('/users', usersModule());
  api.use('/organizations', organizationsModule());
  api.use('/media', mediaModule());
  api.use('/jobs', jobsModule());
  api.use('/taxonomy', taxonomyModule());
  api.use('/geo', geoModule());
  api.use('/language', languageModule());
  api.use('/submissions', submissionsModule());
  api.use('/ai', aiModule());
  api.use('/classification', classificationModule());
  api.use('/clusters', clustersModule());
  api.use('/capability-profiles', capabilityProfilesModule());
  api.use('/matching', matchingModule());
  api.use('/challenges', challengesModule());
  api.use('/workflow', workflowModule());
  api.use('/claims', claimsModule());
  api.use('/teams', teamsModule());
  api.use('/agreements', agreementsModule());
  api.use('/projects', projectsModule());
  api.use('/milestones', milestonesModule());
  api.use('/validation', validationModule());
  api.use('/disputes', disputesModule());
  api.use('/notifications', notificationsModule());
  api.use('/analytics', analyticsModule());
  api.use('/integrations', integrationsModule());

  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
