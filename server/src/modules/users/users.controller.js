import * as usersService from './users.service.js';
import usersPolicy, { projectUser } from './users.policy.js';
import { toPublicMembership } from './users.mapper.js';

export async function getMe(req, res) {
  const user = await usersService.findById(req.user.id);
  res.json({ data: projectUser(user, req.projection || 'assignee') });
}

export async function updateMe(req, res) {
  const user = await usersService.update(req.user.id, req.body);
  res.json({ data: projectUser(user, 'assignee') });
}

export async function getUser(req, res) {
  const user = await usersService.findById(req.params.id);
  res.json({ data: projectUser(user, req.projection || 'assignee') });
}

export async function listUsers(req, res) {
  const result = await usersService.list(req.query);
  res.json({
    data: result.data.map((u) => projectUser(u, req.projection || 'assignee')),
    pagination: result.pagination,
  });
}

export async function getUserMemberships(req, res) {
  const memberships = await usersService.getMembershipsByUser(req.params.id);
  res.json({ data: memberships.map(toPublicMembership) });
}

export async function createMembership(req, res) {
  const membership = await usersService.createMembership({
    ...req.body,
    invitedBy: req.user.id,
  });
  res.status(201).json({ data: toPublicMembership(membership) });
}

export default { getMe, updateMe, getUser, listUsers, getUserMemberships, createMembership };
