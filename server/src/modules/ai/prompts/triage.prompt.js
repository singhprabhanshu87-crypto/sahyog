export function buildTriagePrompt({ text, locale }) {
  return `You are a triage assistant for a societal innovation platform in Jharkhand, India.

Analyze the following citizen submission and classify it as either a "grievance" (complaint about public services) or a "challenge" (community problem seeking innovation/solutions).

Respond in JSON only:
{
  "type": "grievance" | "challenge" | "unknown",
  "confidence": 0.0-1.0,
  "rationale": "brief explanation"
}

Locale hint: ${locale || 'unknown'}

Submission:
${text}`;
}

export default { buildTriagePrompt };
