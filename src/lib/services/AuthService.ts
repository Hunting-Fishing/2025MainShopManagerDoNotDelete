
import { supabase } from '@/lib/supabase';
import { cleanupAuthState } from '@/utils/authCleanup';

export interface SignUpData {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  error: Error | null;
  data?: any;
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Clean up any existing auth state
      cleanupAuthState();

      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Could not perform global sign out:', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Force page reload for clean state
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }

      return { error: null, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Sign in failed') 
      };
    }
  }

  /**
   * Sign up with email, password and profile data
   */
  static async signUp(
    email: string, 
    password: string, 
    profileData: SignUpData
  ): Promise<AuthResponse> {
    try {
      // Clean up any existing auth state
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: profileData.firstName.trim(),
            last_name: profileData.lastName.trim(),
            full_name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`
          }
        }
      });

      if (error) {
        return { error };
      }

      return { error: null, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Sign up failed') 
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<AuthResponse> {
    try {
      // Clean up auth state first
      cleanupAuthState();

      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.warn('Sign out error:', error);
      }

      // Force redirect to login regardless of error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even on error
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      
      return { 
        error: error instanceof Error ? error : new Error('Sign out failed') 
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const redirectUrl = `${window.location.origin}/login`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      return { error };
    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Password reset failed') 
      };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error };
    } catch (error) {
      console.error('Password update error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Password update failed') 
      };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error('Get session error:', error);
      return { 
        session: null, 
        error: error instanceof Error ? error : new Error('Failed to get session') 
      };
    }
  }
}
