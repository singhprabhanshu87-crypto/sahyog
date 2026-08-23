export const TAXONOMY_VERSION = '1.0.0';

export const THEMATIC_DOMAINS = Object.freeze([
  {
    id: 'education',
    label: 'Education',
    description: 'Schools, literacy, vocational training, and learning access',
    keywords: ['school', 'teacher', 'student', 'education', 'learning', 'शिक्षा'],
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    description: 'Farming, crops, livestock, and rural livelihoods',
    keywords: ['farm', 'crop', 'agriculture', 'कृषि', 'खेती'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    description: 'Primary health, maternal care, and medical access',
    keywords: ['health', 'hospital', 'doctor', 'clinic', 'स्वास्थ्य'],
  },
  {
    id: 'water',
    label: 'Water & Sanitation',
    description: 'Drinking water, irrigation, and sanitation infrastructure',
    keywords: ['water', 'jal', 'पानी', 'sanitation', 'toilet'],
  },
  {
    id: 'livelihood',
    label: 'Livelihood & Employment',
    description: 'Jobs, skills, entrepreneurship, and economic opportunity',
    keywords: ['employment', 'job', 'livelihood', 'रोजगार'],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Roads, electricity, connectivity, and public works',
    keywords: ['road', 'electricity', 'bridge', 'सड़क', 'बिजली'],
  },
  {
    id: 'governance',
    label: 'Governance & Rights',
    description: 'Public services, grievances, and civic participation',
    keywords: ['grievance', 'rights', 'service', 'शिकायत'],
  },
  {
    id: 'environment',
    label: 'Environment',
    description: 'Forests, pollution, climate resilience, and conservation',
    keywords: ['forest', 'pollution', 'environment', 'पर्यावरण'],
  },
]);

export const TRL_BANDS = Object.freeze([
  { band: 1, label: 'TRL 1–2', description: 'Basic research / concept formulation', min: 1, max: 2 },
  { band: 2, label: 'TRL 3–4', description: 'Proof of concept / lab validation', min: 3, max: 4 },
  { band: 3, label: 'TRL 5–6', description: 'Pilot / prototype in relevant environment', min: 5, max: 6 },
  { band: 4, label: 'TRL 7–8', description: 'Demonstration / pre-commercial', min: 7, max: 8 },
  { band: 5, label: 'TRL 9', description: 'Deployed and operational', min: 9, max: 9 },
]);

export const SRL_BANDS = Object.freeze([
  { band: 1, label: 'SRL 1–2', description: 'Problem awareness / community identification', min: 1, max: 2 },
  { band: 2, label: 'SRL 3–4', description: 'Community engagement / needs validation', min: 3, max: 4 },
  { band: 3, label: 'SRL 5–6', description: 'Co-design / pilot with community', min: 5, max: 6 },
  { band: 4, label: 'SRL 7–8', description: 'Community adoption / scaling', min: 7, max: 8 },
  { band: 5, label: 'SRL 9', description: 'Sustained community ownership', min: 9, max: 9 },
]);

export const CLOSURE_REASON_CODES = Object.freeze([
  { code: 'resolved', label: 'Resolved', description: 'Challenge or grievance fully addressed' },
  { code: 'duplicate', label: 'Duplicate', description: 'Merged with an existing cluster' },
  { code: 'withdrawn', label: 'Withdrawn', description: 'Submitter withdrew the submission' },
  { code: 'out_of_scope', label: 'Out of Scope', description: 'Not within platform mandate' },
  { code: 'no_capacity', label: 'No Capacity', description: 'No matching organization available' },
  { code: 'forwarded', label: 'Forwarded', description: 'Forwarded to external grievance system' },
  { code: 'expired', label: 'Expired', description: 'No action within SLA window' },
  { code: 'invalid', label: 'Invalid', description: 'Spam, test, or invalid submission' },
]);

export default {
  TAXONOMY_VERSION,
  THEMATIC_DOMAINS,
  TRL_BANDS,
  SRL_BANDS,
  CLOSURE_REASON_CODES,
};
