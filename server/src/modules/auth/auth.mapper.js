export function toPublic(tokens) {
  if (!tokens) return null;
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    tokenType: 'Bearer',
    user: tokens.user
      ? {
          id: tokens.user.id,
          email: tokens.user.email,
          name: tokens.user.name,
          role: tokens.user.role,
        }
      : undefined,
  };
}

export function toAssignee(tokens) {
  return toPublic(tokens);
}

export function toInternal(tokens) {
  if (!tokens) return null;
  return {
    ...tokens,
    sessionId: tokens.sessionId,
  };
}

export default { toPublic, toAssignee, toInternal };
