import * as service from './projects.service.js';
import projectsPolicy, { projectProject } from './projects.policy.js';

export async function createProject(req, res) {
  const project = await service.create(req.body, req.user);
  res.status(201).json({ data: projectProject(project, req.projection || 'assignee') });
}

export async function getProject(req, res) {
  const project = await service.findById(req.params.id);
  res.json({ data: projectProject(project, req.projection || 'assignee') });
}

export default { createProject, getProject };
