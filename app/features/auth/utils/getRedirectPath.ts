import { AuthRedirectTargetType, User, UserCredentials } from "../schema/auth.type";
import { Roles } from "../schema/role.schema";

export function getRedirectPath(response: User | UserCredentials, returnUrl?: string): AuthRedirectTargetType {
  if (returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")) {
    return returnUrl as AuthRedirectTargetType;
  }
  let redirectTarget: AuthRedirectTargetType = "/";
  const role = (response as User).role ?? (response as UserCredentials).user?.role;
  switch (role) {
    case Roles.SUPER_ADMIN:
    case Roles.ADMIN:
      redirectTarget = "/admin";
      break;
    case Roles.RECRUITER:
      redirectTarget = "/recruiter";
      break;
    default:
      redirectTarget = "/jobs";
  }
  return redirectTarget;
}
