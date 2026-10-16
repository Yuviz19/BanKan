export const UserRoleEnum = {
  OWNER: "onwner",
  ADMIN: "admin",
  MEMBER: "member"
}

export const AvailableUserRoler = Object.values(UserRoleEnum);

export const invitationStatusEnum = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
  CANCELLED: "cancelled"
}

export const AvailableInvStatus = Object.values(invitationStatusEnum);

export const taskStatusEnum = {
  "TO-DO": "to-do",
  "IN PROGRESS": "in progress",
  DONE: "done"
}

export const AvailableTasks = Object.values(taskStatusEnum);

export const priorityEnum = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
}

export const AvailablePriority = Object.values(priorityEnum);

export const activityEnum = {
  CARD_CREATED: "card created",
  CARD_MOVED: "card moved",
  CARD_ASSIGNED: "card assigned",
  PRIORITY_CHANGED: "priority changed",
  COMMENT_ADDED: "comment added"
}

export const AvailableActivities = Object.values(activityEnum);
