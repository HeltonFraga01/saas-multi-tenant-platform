import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../auth/service';
import type { AuthUser, AuthSession, LoginCredentials, RegisterData } from '../auth/types';
import { handleApiError } from '../utils/errors';

interface AuthStore {
  // State
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  session: null,
  loading: false,
  initialized: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set: (partial: Partial<AuthStore>) => void, get: () => AuthStore) => ({
      ...initialState,

      signIn: async (credentials: LoginCredentials) => {
        set({ loading: true, error: null });
        try {
          const session = await authService.signIn(credentials);
          set({ 
            session, 
            user: session.user, 
            loading: false,
            error: null 
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({ 
            loading: false, 
            error: apiError.message,
            session: null,
            user: null 
          });
          throw apiError;
        }
      },

      signUp: async (data: RegisterData) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.signUp(data);
          set({ 
            user, 
            loading: false,
            error: null 
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({ 
            loading: false, 
            error: apiError.message 
          });
          throw apiError;
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await authService.signOut();
          set({ 
            ...initialState,
            initialized: true 
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({ 
            loading: false, 
            error: apiError.message 
          });
          throw apiError;
        }
      },

      initialize: async () => {
        if (get().initialized) return;
        
        set({ loading: true, error: null });
        try {
          const session = await authService.getSession();
          set({ 
            session,
            user: session?.user || null,
            loading: false,
            initialized: true,
            error: null 
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({ 
            loading: false, 
            initialized: true,
            error: apiError.message,
            session: null,
            user: null 
          });
        }
      },

      refreshSession: async () => {
        try {
          const session = await authService.refreshSession();
          set({ 
            session,
            user: session.user,
            error: null 
          });
        } catch (error) {
          const apiError = handleApiError(error);
          set({ 
            error: apiError.message,
            session: null,
            user: null 
          });
          throw apiError;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state: AuthStore) => ({
        session: state.session,
        user: state.user,
        initialized: state.initialized,
      }),
    }
  )
);