import type { ServerResponse } from "node:http";

import type { UserRole } from "../models/User.js";

type UserWithRole = {
  role?: UserRole;
};

function sendForbidden(
  res: ServerResponse
) {
  res.writeHead(403, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      message:
        "You do not have permission to access this resource",
    })
  );
}

export function authorize(
  user: UserWithRole,
  requiredRole: UserRole,
  res: ServerResponse
): boolean {
  if (user.role !== requiredRole) {
    sendForbidden(res);
    return false;
  }

  return true;
}