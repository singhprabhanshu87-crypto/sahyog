import { Boundary } from './geo.schema.js';
import { BOUNDARY_LEVELS, GEO_PRECISION } from './geo.constants.js';
import config from '../../config/index.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';
import logger from '../../common/lib/logger.js';

const LEVEL_ORDER = [
  BOUNDARY_LEVELS.PANCHAYAT,
  BOUNDARY_LEVELS.BLOCK,
  BOUNDARY_LEVELS.DISTRICT,
  BOUNDARY_LEVELS.STATE,
];

/**
 * Resolve lat/lng to district/block/panchayat via point-in-polygon query.
 */
export async function resolvePoint(lat, lng) {
  const point = { type: 'Point', coordinates: [lng, lat] };

  const matches = await Boundary.find({
    geometry: { $geoIntersects: { $geometry: point } },
  })
    .sort({ level: 1 })
    .lean();

  const byLevel = {};
  for (const b of matches) {
    if (!byLevel[b.level]) byLevel[b.level] = b;
  }

  const district = byLevel[BOUNDARY_LEVELS.DISTRICT] || null;
  const block = byLevel[BOUNDARY_LEVELS.BLOCK] || null;
  const panchayat = byLevel[BOUNDARY_LEVELS.PANCHAYAT] || null;

  const publicLocation = snapToPublicCentroid({ lat, lng }, { district, block, panchayat });

  return { district, block, panchayat, publicLocation, raw: { lat, lng } };
}

/**
 * Snap coordinates to public centroid for privacy based on configured precision.
 */
export function snapToPublicCentroid(point, boundaries = {}) {
  const precision = config.PUBLIC_LOCATION_PRECISION;
  let target = null;

  if (precision === 'panchayat' && boundaries.panchayat) {
    target = boundaries.panchayat;
  } else if (precision === 'block' && boundaries.block) {
    target = boundaries.block;
  } else if (precision === 'district' && boundaries.district) {
    target = boundaries.district;
  } else {
    target = boundaries.panchayat || boundaries.block || boundaries.district;
  }

  if (target?.publicCentroid?.coordinates) {
    const [lng, lat] = target.publicCentroid.coordinates;
    return { lat, lng, precision: target.level, boundaryCode: target.code };
  }

  if (target?.centroid?.coordinates) {
    const [lng, lat] = target.centroid.coordinates;
    return { lat, lng, precision: target.level, boundaryCode: target.code };
  }

  return { lat: point.lat, lng: point.lng, precision: GEO_PRECISION.EXACT };
}

/**
 * Find submissions within radius for dedup — returns boundary codes in range.
 */
export async function radiusQuery(lat, lng, radiusMeters) {
  const point = { type: 'Point', coordinates: [lng, lat] };

  const boundaries = await Boundary.find({
    centroid: {
      $nearSphere: {
        $geometry: point,
        $maxDistance: radiusMeters,
      },
    },
  })
    .limit(50)
    .lean();

  return {
    boundaryCodes: boundaries.map((b) => b.code),
    boundaries,
    center: { lat, lng },
    radiusMeters,
  };
}

export async function list({ level, parentCode, page, limit }) {
  const filter = {};
  if (level) filter.level = level;
  if (parentCode) filter.parentCode = parentCode;
  return paginate(Boundary, { filter, page, limit, sort: { name: 1 } });
}

export async function findByCode(code) {
  const boundary = await Boundary.findOne({ code }).lean();
  if (!boundary) throw new NotFoundError('Boundary not found');
  return boundary;
}

export async function resolveAndPublish(lat, lng, actor = { id: 'system', type: 'system' }) {
  const resolution = await resolvePoint(lat, lng);

  await publish({
    actor,
    action: 'geo.resolved',
    resourceType: 'geo',
    resourceId: resolution.district?.code || 'unknown',
    payload: {
      lat,
      lng,
      districtCode: resolution.district?.code,
      blockCode: resolution.block?.code,
      panchayatCode: resolution.panchayat?.code,
    },
  });

  return resolution;
}

export async function seedStubBoundaries() {
  const count = await Boundary.countDocuments();
  if (count > 0) return;

  logger.info('Seeding stub Jharkhand boundaries for development');

  const stubs = [
    {
      code: 'JH-RAN',
      name: 'Ranchi',
      level: BOUNDARY_LEVELS.DISTRICT,
      parentCode: 'JH',
      centroid: { type: 'Point', coordinates: [85.3096, 23.3441] },
      publicCentroid: { type: 'Point', coordinates: [85.3096, 23.3441] },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.0, 23.0],
            [85.6, 23.0],
            [85.6, 23.6],
            [85.0, 23.6],
            [85.0, 23.0],
          ],
        ],
      },
    },
    {
      code: 'JH-RAN-BLK1',
      name: 'Ranchi Block',
      level: BOUNDARY_LEVELS.BLOCK,
      parentCode: 'JH-RAN',
      centroid: { type: 'Point', coordinates: [85.32, 23.35] },
      publicCentroid: { type: 'Point', coordinates: [85.32, 23.35] },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2, 23.2],
            [85.45, 23.2],
            [85.45, 23.45],
            [85.2, 23.45],
            [85.2, 23.2],
          ],
        ],
      },
    },
    {
      code: 'JH-RAN-PAN1',
      name: 'Sample Panchayat',
      level: BOUNDARY_LEVELS.PANCHAYAT,
      parentCode: 'JH-RAN-BLK1',
      centroid: { type: 'Point', coordinates: [85.33, 23.36] },
      publicCentroid: { type: 'Point', coordinates: [85.33, 23.36] },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.28, 23.32],
            [85.38, 23.32],
            [85.38, 23.38],
            [85.28, 23.38],
            [85.28, 23.32],
          ],
        ],
      },
    },
  ];

  await Boundary.insertMany(stubs);
}

export default {
  resolvePoint,
  snapToPublicCentroid,
  radiusQuery,
  list,
  findByCode,
  resolveAndPublish,
  seedStubBoundaries,
};
