/**
 * Full demo dataset — users, challenges, matching, claims, teams, projects, milestones.
 * Usage: node scripts/seed-demo.js
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/modules/users/users.schema.js';
import { Organization } from '../src/modules/organizations/organizations.schema.js';
import { CapabilityProfile } from '../src/modules/capability-profiles/capability-profiles.schema.js';
import { Challenge } from '../src/modules/challenges/challenges.schema.js';
import { WorkflowInstance } from '../src/modules/workflow/workflow.schema.js';
import { Claim } from '../src/modules/claims/claims.schema.js';
import { Team } from '../src/modules/teams/teams.schema.js';
import { Project } from '../src/modules/projects/projects.schema.js';
import { Milestone } from '../src/modules/milestones/milestones.schema.js';
import { Agreement } from '../src/modules/agreements/agreements.schema.js';
import { ValidationRecord } from '../src/modules/validation/validation.schema.js';
import {
  ROLES,
  ORG_TYPES,
  ORG_VERIFICATION_STATES,
  CHALLENGE_WORKFLOW_STATES,
} from '../src/config/constants.js';
import { TEAM_ROLES } from '../src/modules/teams/teams.constants.js';
import { AGREEMENT_STATUS } from '../src/modules/agreements/agreements.constants.js';
import { CLAIM_STATUS } from '../src/modules/claims/claims.constants.js';
import { PROJECT_STATUS } from '../src/modules/projects/projects.constants.js';
import { MILESTONE_STATUS } from '../src/modules/milestones/milestones.constants.js';
import logger from '../src/common/lib/logger.js';

async function upsertUser({ email, name, role, orgId, districts }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name, role, primaryOrgId: orgId, districts, emailVerified: true });
  }
  return user;
}

async function seed() {
  await connectDatabase();

  const pmu = await upsertUser({
    email: 'pmu@sahyog.demo',
    name: 'PMU Admin',
    role: ROLES.PMU_ADMIN,
  });

  const districtOfficer = await upsertUser({
    email: 'district@sahyog.demo',
    name: 'District Officer Ranchi',
    role: ROLES.DISTRICT_OFFICER,
    districts: ['JH-RAN'],
  });

  const heiOrg = await Organization.findOne({ type: ORG_TYPES.HEI });
  if (!heiOrg) {
    throw new Error('Run seed-institutions.js first');
  }

  const faculty = await upsertUser({
    email: 'faculty@sahyog.demo',
    name: 'Dr. Faculty PI',
    role: ROLES.HEI_FACULTY,
    orgId: heiOrg._id,
  });

  const citizen = await upsertUser({
    email: 'citizen@sahyog.demo',
    name: 'Community Citizen',
    role: ROLES.CITIZEN,
    districts: ['JH-RAN'],
  });

  const validator = await upsertUser({
    email: 'validator@sahyog.demo',
    name: 'Community Validator',
    role: ROLES.COMMUNITY_VALIDATOR,
    districts: ['JH-RAN'],
  });

  await CapabilityProfile.updateOne(
    { orgId: heiOrg._id },
    {
      $set: {
        orgId: heiOrg._id,
        axes: {
          topics: [
            { code: 'water', label: 'Water & Sanitation', source: 'self_declared' },
            { code: 'agriculture', label: 'Agriculture', source: 'self_declared' },
          ],
          methodologies: [{ code: 'field_study', label: 'Field Study', source: 'self_declared' }],
          applications: [{ code: 'rural_dev', label: 'Rural Development', source: 'self_declared' }],
          facilities: [{ code: 'field_station', label: 'Field Station', source: 'self_declared' }],
          capacity: { maxConcurrentChallenges: 5, currentLoad: 1 },
        },
        selfDeclaration: {
          summary: 'Strong field research capacity in water and agriculture.',
          strengths: ['Community engagement', 'Field labs'],
          declaredAt: new Date(),
          declaredBy: faculty._id,
        },
        updatedBy: faculty._id,
      },
    },
    { upsert: true },
  );

  let challenge = await Challenge.findOne({ title: 'Demo: Village Water Quality Monitoring' });
  if (!challenge) {
    challenge = await Challenge.create({
      title: 'Demo: Village Water Quality Monitoring',
      description: 'Community reports inconsistent water quality in tribal hamlets near Ranchi. Need low-cost monitoring and local remediation pathways.',
      submittedBy: citizen._id,
      districtCode: 'JH-RAN',
      location: { lat: 23.35, lng: 85.33, precision: 'panchayat' },
      workflowState: CHALLENGE_WORKFLOW_STATES.SCOPED,
      scopedBrief: {
        title: 'Scoped: Tribal Hamlet Water Quality',
        summary: 'Deploy community-led water testing kits and HEI-supported analysis for 5 panchayats.',
        objectives: ['Baseline water quality map', 'Train local facilitators'],
        taxonomyCodes: ['water', 'rural_dev'],
        scopedAt: new Date(),
        scopedBy: districtOfficer._id,
      },
    });
  }

  await WorkflowInstance.updateOne(
    { challengeId: challenge._id },
    {
      $set: {
        challengeId: challenge._id,
        currentState: CHALLENGE_WORKFLOW_STATES.SCOPED,
        ownerRole: 'pmu_admin',
        visibility: 'assignee',
        slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    { upsert: true },
  );

  let claim = await Claim.findOne({ challengeId: challenge._id, orgId: heiOrg._id });
  if (!claim) {
    claim = await Claim.create({
      challengeId: challenge._id,
      orgId: heiOrg._id,
      claimedBy: faculty._id,
      status: CLAIM_STATUS.ACTIVE,
      exclusivityLock: true,
      coiChecked: true,
      claimWindowEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    challenge.claimedOrgId = heiOrg._id;
    await challenge.save();
  }

  let team = await Team.findOne({ challengeId: challenge._id, orgId: heiOrg._id });
  if (!team) {
    team = await Team.create({
      challengeId: challenge._id,
      orgId: heiOrg._id,
      name: 'Water Quality Demo Team',
      createdBy: faculty._id,
      members: [
        { userId: faculty._id, role: TEAM_ROLES.FACULTY_PI, orgId: heiOrg._id },
        { userId: citizen._id, role: TEAM_ROLES.COMMUNITY_LIAISON },
      ],
    });
  }

  let project = await Project.findOne({ challengeId: challenge._id });
  if (!project) {
    project = await Project.create({
      challengeId: challenge._id,
      teamId: team._id,
      orgId: heiOrg._id,
      title: 'Water Quality Monitoring Pilot',
      description: 'Pilot deployment of community water testing in Ranchi tribal blocks.',
      status: PROJECT_STATUS.ACTIVE,
      trlTarget: 4,
      srlTarget: 3,
      trlCurrent: 2,
      srlCurrent: 2,
      claimId: claim._id,
      createdBy: faculty._id,
      boardItems: [
        { type: 'task', title: 'Procure testing kits', status: 'done' },
        { type: 'task', title: 'Train facilitators', status: 'open' },
      ],
    });
    challenge.projectId = project._id;
    await challenge.save();
    team.projectId = project._id;
    await team.save();
  }

  await Agreement.updateOne(
    { challengeId: challenge._id },
    {
      $set: {
        challengeId: challenge._id,
        projectId: project._id,
        teamId: team._id,
        status: AGREEMENT_STATUS.SIGNED,
        ipTerms: { ownership: 'shared', commercialUse: false, attributionRequired: true },
        requiredSigners: ['hei_rep'],
        signatures: [{ userId: faculty._id, role: 'hei_rep', signedAt: new Date() }],
        blocksIndustryUntilSigned: true,
        createdBy: faculty._id,
      },
    },
    { upsert: true },
  );

  const milestoneExists = await Milestone.findOne({ projectId: project._id });
  if (!milestoneExists) {
    await Milestone.create({
      projectId: project._id,
      challengeId: challenge._id,
      title: 'Baseline Survey Complete',
      description: 'Complete baseline water quality survey across target panchayats.',
      gateDefinition: {
        criteria: ['50+ samples collected', 'GIS map uploaded'],
        requiredEvidenceTypes: ['report', 'geo_map'],
        trlGate: 3,
      },
      status: MILESTONE_STATUS.PENDING,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  await ValidationRecord.updateOne(
    { challengeId: challenge._id },
    {
      $setOnInsert: {
        challengeId: challenge._id,
        projectId: project._id,
        status: 'pending',
        requiredSignOffCount: 2,
      },
    },
    { upsert: true },
  );

  logger.info({
    challengeId: challenge._id.toString(),
    projectId: project._id.toString(),
    teamId: team._id.toString(),
    users: [pmu.email, faculty.email, citizen.email, validator.email],
  }, 'Demo seed complete');

  await disconnectDatabase();
}

seed().catch((err) => {
  logger.fatal({ err }, 'Demo seed failed');
  process.exit(1);
});
