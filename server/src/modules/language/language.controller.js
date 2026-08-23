import * as languageService from './language.service.js';
import languagePolicy, { projectLanguageResult } from './language.policy.js';

export async function detectLanguage(req, res) {
  const result = await languageService.detect(req.body.text);
  res.json({ data: projectLanguageResult(result, req.projection || 'public') });
}

export async function translateText(req, res) {
  const result = await languageService.translate(req.body.text, {
    sourceLocale: req.body.sourceLocale,
    targetLocale: req.body.targetLocale,
  });
  res.json({ data: projectLanguageResult(result, req.projection || 'public') });
}

export default { detectLanguage, translateText };
