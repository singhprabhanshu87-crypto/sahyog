import { paginate as paginateQuery } from './paginate.js';

/**
 * Generic guarded finite state machine runner.
 * Consumed by workflow, challenges, claims, disputes, milestones.
 */
export function createStateMachine(definition) {
  const { states, transitions, onTransition } = definition;

  function getAvailableTransitions(currentState) {
    return transitions.filter((t) => t.from === currentState || t.from === '*');
  }

  async function transition({ currentState, event, actor, resource, context = {} }) {
    const rule = transitions.find(
      (t) =>
        (t.from === currentState || t.from === '*') &&
        (t.event === event || t.on === event),
    );

    if (!rule) {
      return {
        allowed: false,
        reason: `No transition for event "${event}" from state "${currentState}"`,
      };
    }

    if (rule.guard) {
      const guardResult = await rule.guard({ actor, resource, context, currentState, event });
      if (!guardResult.allowed) {
        return { allowed: false, reason: guardResult.reason || 'Guard rejected transition' };
      }
    }

    const nextState = typeof rule.to === 'function' ? rule.to({ resource, context }) : rule.to;

    if (!states.includes(nextState)) {
      return { allowed: false, reason: `Invalid target state "${nextState}"` };
    }

    if (rule.exitCriteria) {
      const exitResult = await rule.exitCriteria({ actor, resource, context, currentState });
      if (!exitResult.met) {
        return { allowed: false, reason: exitResult.reason || 'Exit criteria not met' };
      }
    }

    const result = {
      allowed: true,
      from: currentState,
      to: nextState,
      event,
    };

    if (onTransition) {
      await onTransition({ ...result, actor, resource, context });
    }

    return result;
  }

  return { transition, getAvailableTransitions, states };
}

export default { createStateMachine };
