import { createClient, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { sign, verify } from "jsonwebtoken";
import {
  AuthConfig,
  AuthError,
  OAuthProvider,
  Permission,
  ROLE_PERMISSIONS,
  Session,
  SignInData,
  SignUpData,
  User,
  UserRole,
} from "./types";

/**
 * Authentication Service
 * Provides authentication and authorization functionality with multi-tenancy support
 */
export class AuthService {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor(config: AuthConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.jwtSecret = config.jwtSecret || "default-secret-change-in-production";
  }

  /**
   * Sign up new user
   */
  async signUp(data: SignUpData): Promise<{ user: User; session: Session }> {
    const { email, password, organizationId, role = "user", metadata } = data;

    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            organizationId,
            role,
            ...metadata,
          },
        },
      });

      if (error) throw new AuthError(error.message, error.status?.toString());
      if (!authData.user || !authData.session) {
        throw new AuthError("Sign up failed: No user or session returned");
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        role,
        organizationId,
        metadata: authData.user.user_metadata,
        createdAt: new Date(authData.user.created_at),
      };

      const session: Session = {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        user,
        expiresAt: new Date(authData.session.expires_at! * 1000),
      };

      return { user, session };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Sign up failed", (error as Error).message);
    }
  }

  /**
   * Sign in user
   */
  async signIn(data: SignInData): Promise<{ user: User; session: Session }> {
    const { email, password } = data;

    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new AuthError(error.message, error.status?.toString());
      if (!authData.user || !authData.session) {
        throw new AuthError("Sign in failed: No user or session returned");
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        role: (authData.user.user_metadata?.role as UserRole) || "user",
        organizationId: authData.user.user_metadata?.organizationId || "",
        metadata: authData.user.user_metadata,
        createdAt: new Date(authData.user.created_at),
      };

      const session: Session = {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        user,
        expiresAt: new Date(authData.session.expires_at! * 1000),
      };

      return { user, session };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Sign in failed", (error as Error).message);
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw new AuthError(error.message);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Sign out failed", (error as Error).message);
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) throw new AuthError(error.message);
      if (!data.session) return null;

      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email!,
        role: (data.session.user.user_metadata?.role as UserRole) || "user",
        organizationId: data.session.user.user_metadata?.organizationId || "",
        metadata: data.session.user.user_metadata,
        createdAt: new Date(data.session.user.created_at),
      };

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user,
        expiresAt: new Date(data.session.expires_at! * 1000),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Failed to get session", (error as Error).message);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  /**
   * OAuth sign in
   */
  async signInWithOAuth(provider: OAuthProvider): Promise<{ url: string }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw new AuthError(error.message);
      if (!data.url) throw new AuthError("OAuth URL not returned");

      return { url: data.url };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("OAuth sign in failed", (error as Error).message);
    }
  }

  /**
   * Verify multi-tenant access
   */
  async verifyTenant(userId: string, organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("organization_id")
        .eq("id", userId)
        .single();

      if (error) {
        // If the table doesn't exist or query fails, check user metadata
        const session = await this.getSession();
        if (session?.user.id === userId) {
          return session.user.organizationId === organizationId;
        }
        return false;
      }

      return data?.organization_id === organizationId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(role, permission));
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw new AuthError(error.message);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Password reset failed", (error as Error).message);
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new AuthError(error.message);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Password update failed", (error as Error).message);
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user: User, expiresIn: string = "7d"): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sign(payload, this.jwtSecret, { expiresIn } as any);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): User | null {
    try {
      const decoded = verify(token, this.jwtSecret) as {
        userId: string;
        email: string;
        role: UserRole;
        organizationId: string;
      };

      return {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };
    } catch (error) {
      return null;
    }
  }
}

/**
 * Middleware for Next.js/Express
 */
export function withAuth(
  handler: (req: any, res: any) => Promise<any>,
  options?: {
    requiredRole?: UserRole;
    requiredPermission?: Permission;
  }
) {
  return async (req: any, res: any) => {
    try {
      // This is a simplified middleware - in production, you'd get the auth service from context
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.substring(7);
      
      // Create a temporary auth service to verify the token
      const authService = new AuthService({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        jwtSecret: process.env.JWT_SECRET,
      });

      const user = authService.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      // Check role if required
      if (options?.requiredRole) {
        const roleHierarchy: Record<UserRole, number> = {
          admin: 4,
          manager: 3,
          employee: 2,
          user: 1,
          guest: 0,
        };

        if (roleHierarchy[user.role] < roleHierarchy[options.requiredRole]) {
          return res.status(403).json({ error: "Forbidden: Insufficient role" });
        }
      }

      // Check permission if required
      if (options?.requiredPermission) {
        if (!authService.hasPermission(user.role, options.requiredPermission)) {
          return res.status(403).json({ error: "Forbidden: Missing permission" });
        }
      }

      // Attach user to request
      req.user = user;

      return handler(req, res);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Create auth service instance
 */
export function createAuthService(config: AuthConfig): AuthService {
  return new AuthService(config);
}

// Re-export types
export type {
  AuthConfig,
  User,
  Session,
  SignUpData,
  SignInData,
  UserRole,
  Permission,
  OAuthProvider,
} from "./types";
export { AuthError, ROLE_PERMISSIONS } from "./types";
