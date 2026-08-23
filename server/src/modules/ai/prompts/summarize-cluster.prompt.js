export function buildSummarizeClusterPrompt({ submissions, clusterMeta }) {
  const submissionTexts = (submissions || [])
    .map((s, i) => `[${i + 1}] ${s.textNormalized || s.text || ''}`)
    .join('\n');

  return `You are summarizing a cluster of related citizen submissions for a societal innovation platform.

Cluster metadata:
- Duplicate count: ${clusterMeta?.duplicateCount || submissions?.length || 0}
- District: ${clusterMeta?.districtCode || 'unknown'}
- Triage type: ${clusterMeta?.triageType || 'unknown'}

Provide a concise summary (2-3 sentences) of the common theme and key issues.

Respond in JSON only:
{
  "summary": "concise summary text",
  "keyThemes": ["theme1", "theme2"],
  "urgency": "low" | "medium" | "high"
}

Submissions:
${submissionTexts}`;
}

export default { buildSummarizeClusterPrompt };
