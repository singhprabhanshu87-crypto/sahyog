/**
 * Seed minimal Jharkhand boundary GeoJSON (sample districts).
 * Usage: node scripts/seed-boundaries.js
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import logger from '../src/common/lib/logger.js';

const boundarySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    level: { type: String, enum: ['state', 'district', 'block'], default: 'district' },
    parentCode: { type: String, default: null },
    geojson: { type: mongoose.Schema.Types.Mixed, required: true },
    centroid: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { timestamps: true },
);

const Boundary = mongoose.models.Boundary ?? mongoose.model('Boundary', boundarySchema);

const JHARKHAND_SAMPLE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { code: 'JH-RAN', name: 'Ranchi', level: 'district' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [85.0, 23.2], [85.6, 23.2], [85.6, 23.6], [85.0, 23.6], [85.0, 23.2],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'JH-DHN', name: 'Dhanbad', level: 'district' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [86.2, 23.7], [86.8, 23.7], [86.8, 24.1], [86.2, 24.1], [86.2, 23.7],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'JH-JAM', name: 'Jamshedpur', level: 'district' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [86.0, 22.7], [86.6, 22.7], [86.6, 23.1], [86.0, 23.1], [86.0, 22.7],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'JH-DEH', name: 'Deoghar', level: 'district' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [86.6, 24.3], [87.2, 24.3], [87.2, 24.7], [86.6, 24.7], [86.6, 24.3],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'JH-HAZ', name: 'Hazaribagh', level: 'district' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [85.2, 23.9], [85.8, 23.9], [85.8, 24.3], [85.2, 24.3], [85.2, 23.9],
        ]],
      },
    },
  ],
};

function centroidOfPolygon(coords) {
  const ring = coords[0];
  let sumLng = 0;
  let sumLat = 0;
  for (const [lng, lat] of ring) {
    sumLng += lng;
    sumLat += lat;
  }
  return [sumLng / ring.length, sumLat / ring.length];
}

async function seed() {
  await connectDatabase();

  await Boundary.updateOne(
    { code: 'JH' },
    {
      $set: {
        code: 'JH',
        name: 'Jharkhand',
        level: 'state',
        geojson: JHARKHAND_SAMPLE_GEOJSON,
        centroid: { type: 'Point', coordinates: [85.5, 23.6] },
      },
    },
    { upsert: true },
  );

  for (const feature of JHARKHAND_SAMPLE_GEOJSON.features) {
    const code = feature.properties.code;
    const centroid = centroidOfPolygon(feature.geometry.coordinates);
    await Boundary.updateOne(
      { code },
      {
        $set: {
          code,
          name: feature.properties.name,
          level: feature.properties.level,
          parentCode: 'JH',
          geojson: feature,
          centroid: { type: 'Point', coordinates: centroid },
        },
      },
      { upsert: true },
    );
  }

  const count = await Boundary.countDocuments();
  logger.info({ count }, 'Boundary seed complete');
  await disconnectDatabase();
}

seed().catch((err) => {
  logger.fatal({ err }, 'Boundary seed failed');
  process.exit(1);
});
