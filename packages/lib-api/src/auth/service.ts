import { getClient } from '../client';
import { ApiError, handleApiError } from '../utils/errors';
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  UpdatePasswordData,
  AuthSession,
} from './types';

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new ApiError('Invalid response from authentication service', 'AUTH_ERROR');
      }

      return {
        user: data.user as AuthUser,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: RegisterData): Promise<AuthUser> {
    try {
      const supabase = getClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company_name: data.companyName,
          },
        },
      });

      if (error) throw error;
      if (!authData.user) {
        throw new ApiError('Failed to create user account', 'SIGNUP_ERROR');
      }

      return authData.user as AuthUser;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthSession | null> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!data.session) return null;

      return {
        user: data.session.user as AuthUser,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      return data.user as AuthUser | null;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update password
   */
  async updatePassword(data: UpdatePasswordData): Promise<void> {
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthSession> {
    try {
      const supabase = getClient();
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      if (!data.session) {
        throw new ApiError('Failed to refresh session', 'REFRESH_ERROR');
      }

      return {
        user: data.session.user as AuthUser,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at || 0,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Set up auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const supabase = getClient();
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription.unsubscribe;
  }
}

export const authService = new AuthService();