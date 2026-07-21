import type { UserApiResponse } from "@/features/auth/types/auth.types";
import type { User } from "@/types/user";

/** Maps the API's snake_case user representation to the app's camelCase domain type. */
export function mapApiUserToUser(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    fullName: apiUser.full_name,
    email: apiUser.email,
    role: apiUser.role,
    isActive: apiUser.is_active,
    isVerified: apiUser.is_verified,
    createdAt: apiUser.created_at,
  };
}
