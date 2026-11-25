
export const ORGANIZATION_ROLES = [
  "OWNER",
  "ADMIN",
  "DEVELOPER",
  "VIEWER",
] as const;

export type OrganizationRole =
  (typeof ORGANIZATION_ROLES)[number];

export const INVITABLE_ROLES = {
  OWNER: ["ADMIN", "DEVELOPER", "VIEWER"],
  ADMIN: ["DEVELOPER", "VIEWER"],
  DEVELOPER: [],
  VIEWER: [],
} as const satisfies Record<OrganizationRole, readonly OrganizationRole[]>;

export function canViewInvitations(role: OrganizationRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canInviteMembers(role: OrganizationRole) {
  return canViewInvitations(role);
}

export function canAssignRole(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole,
  newRole: OrganizationRole,
) {
  if (targetRole === "OWNER") return false;

  return INVITABLE_ROLES[actorRole].includes(
    newRole as never,
  );
}

export function canRemoveMember(
  actorRole: OrganizationRole,
  targetRole: OrganizationRole,
  isSelf: boolean,
) {
  if (isSelf || targetRole === "OWNER") return false;

  if (actorRole === "OWNER") return true;

  if (actorRole === "ADMIN") {
    return targetRole === "DEVELOPER" || targetRole === "VIEWER";
  }

  return false;
}

