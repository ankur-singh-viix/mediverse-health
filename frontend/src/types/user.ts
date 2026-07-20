/**
 * Core domain types shared across features.
 */

export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}
