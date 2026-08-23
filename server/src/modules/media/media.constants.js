import { MEDIA_STATUS } from '../../config/constants.js';

export { MEDIA_STATUS };

export const MEDIA_RESOURCE_TYPES = Object.freeze({
  SUBMISSION: 'submission',
  CHALLENGE: 'challenge',
  MILESTONE: 'milestone',
  ORGANIZATION: 'organization',
  USER: 'user',
});

export default { MEDIA_STATUS, MEDIA_RESOURCE_TYPES };
