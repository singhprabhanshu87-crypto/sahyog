export function buildCategorizePrompt({ text, domains }) {
  const domainList = (domains || [])
    .map((d) => `- ${d.id}: ${d.label} — ${d.description}`)
    .join('\n');

  return `You are a categorization assistant for a societal innovation platform.

Given the submission text, assign one or more thematic domains from the taxonomy below.
Only use domain IDs from the list. Include confidence scores.

Respond in JSON only:
{
  "categories": [
    { "domainId": "education", "label": "Education", "confidence": 0.85 }
  ],
  "rationale": "brief explanation"
}

Available domains:
${domainList}

Submission:
${text}`;
}

export default { buildCategorizePrompt };
