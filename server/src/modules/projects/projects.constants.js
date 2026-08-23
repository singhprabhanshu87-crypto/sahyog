export const PROJECT_STATUS = Object.freeze({
  PLANNING: 'planning',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
});

export const BOARD_ITEM_TYPES = Object.freeze({
  TASK: 'task',
  NOTE: 'note',
  BLOCKER: 'blocker',
});

export default { PROJECT_STATUS, BOARD_ITEM_TYPES };
