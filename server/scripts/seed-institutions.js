/**
 * Seed 10 sample HEI organizations in Jharkhand.
 * Usage: node scripts/seed-institutions.js
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Organization } from '../src/modules/organizations/organizations.schema.js';
import { User } from '../src/modules/users/users.schema.js';
import { ORG_TYPES, ORG_VERIFICATION_STATES, ROLES } from '../src/config/constants.js';
import slugify from '../src/common/utils/slugify.js';
import logger from '../src/common/lib/logger.js';

const HEIS = [
  { name: 'Indian Institute of Technology (Indian School of Mines) Dhanbad', district: 'JH-DHN', city: 'Dhanbad' },
  { name: 'National Institute of Technology Jamshedpur', district: 'JH-JAM', city: 'Jamshedpur' },
  { name: 'Ranchi University', district: 'JH-RAN', city: 'Ranchi' },
  { name: 'Birla Institute of Technology Mesra', district: 'JH-RAN', city: 'Ranchi' },
  { name: 'Central University of Jharkhand', district: 'JH-RAN', city: 'Ranchi' },
  { name: 'Vinoba Bhave University', district: 'JH-HAZ', city: 'Hazaribagh' },
  { name: 'Sidho Kanho Birsha University', district: 'JH-DEH', city: 'Deoghar' },
  { name: 'Kolhan University', district: 'JH-JAM', city: 'Chaibasa' },
  { name: 'Nilamber-Pitamber University', district: 'JH-HAZ', city: 'Medininagar' },
  { name: 'Dr. Shyama Prasad Mukherjee University', district: 'JH-RAN', city: 'Ranchi' },
];

async function seed() {
  await connectDatabase();

  let seedUser = await User.findOne({ email: 'seed@sahyog.local' });
  if (!seedUser) {
    seedUser = await User.create({
      email: 'seed@sahyog.local',
      name: 'Seed Admin',
      role: ROLES.PMU_ADMIN,
      emailVerified: true,
    });
  }

  for (const hei of HEIS) {
    const slug = slugify(hei.name);
    await Organization.updateOne(
      { slug },
      {
        $set: {
          name: hei.name,
          slug,
          type: ORG_TYPES.HEI,
          description: `Sample HEI — ${hei.city}, Jharkhand`,
          verificationStatus: ORG_VERIFICATION_STATES.ACTIVE,
          districtCodes: [hei.district],
          address: { district: hei.city, state: 'Jharkhand' },
          contact: { email: `contact@${slug}.edu.in` },
          createdBy: seedUser._id,
          verifiedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  const count = await Organization.countDocuments({ type: ORG_TYPES.HEI });
  logger.info({ count }, 'Institution seed complete');
  await disconnectDatabase();
}

seed().catch((err) => {
  logger.fatal({ err }, 'Institution seed failed');
  process.exit(1);
});
