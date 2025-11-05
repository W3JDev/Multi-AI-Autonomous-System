/**
 * Authentication Error Class
 */
export class AuthError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * User Role Types
 */
export type UserRole =
  | "admin"
  | "manager"
  | "employee"
  | "user"
  | "guest";

/**
 * Permission Types
 */
export type Permission =
  | "read:all"
  | "write:all"
  | "delete:all"
  | "manage:users"
  | "manage:settings"
  | "view:analytics"
  | "manage:billing";

/**
 * Auth Configuration
 */
export interface AuthConfig {
  supabaseUrl: string;
  supabaseKey: string;
  jwtSecret?: string;
}

/**
 * User Data
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

/**
 * Session Data
 */
export interface Session {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresAt?: Date;
}

/**
 * Sign Up Data
 */
export interface SignUpData {
  email: string;
  password: string;
  organizationId: string;
  role?: UserRole;
  metadata?: Record<string, unknown>;
}

/**
 * Sign In Data
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * OAuth Provider
 */
export type OAuthProvider = "google" | "github" | "azure";

/**
 * Role Permissions Map
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "read:all",
    "write:all",
    "delete:all",
    "manage:users",
    "manage:settings",
    "view:analytics",
    "manage:billing",
  ],
  manager: [
    "read:all",
    "write:all",
    "manage:users",
    "view:analytics",
  ],
  employee: [
    "read:all",
    "write:all",
  ],
  user: [
    "read:all",
  ],
  guest: [],
};
