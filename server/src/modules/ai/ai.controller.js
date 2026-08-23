import * as aiService from './ai.service.js';
import aiPolicy, { projectAiCall } from './ai.policy.js';

export async function complete(req, res) {
  const result = await aiService.complete({
    prompt: req.body.prompt,
    systemPrompt: req.body.systemPrompt,
    model: req.body.model,
    resourceType: 'user',
    resourceId: req.user.id,
  });

  res.json({ data: result });
}

export default { complete };
