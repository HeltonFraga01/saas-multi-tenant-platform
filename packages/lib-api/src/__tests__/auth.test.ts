import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { authService } from '../auth';
import { getClient } from '../client';
import { ApiError } from '../utils/errors';

// Mock the Supabase client
vi.mock('../client', () => ({
  getClient: vi.fn(),
}));

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })),
};

describe('AuthService', () => {
  beforeEach(() => {
    // Reset specific mock implementations instead of clearing all mocks
    mockSupabase.auth.signUp.mockReset();
    mockSupabase.auth.signInWithPassword.mockReset();
    mockSupabase.auth.signOut.mockReset();
    mockSupabase.auth.getUser.mockReset();
    mockSupabase.auth.onAuthStateChange.mockReset();
    
    (getClient as Mock).mockReturnValue(mockSupabase);
  });

  describe('signUp', () => {
    // TODO: Implement signUp method in AuthService
    // it('should sign up user and create company successfully', async () => {
    //   // Test implementation pending
    // });

    it('should handle signUp errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already exists' },
      });

      await expect(
        authService.signUp({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          companyName: 'Test Company',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('signIn', () => {
    it('should signIn user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_at: 1234567890,
        user: mockUser,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'token123',
        refreshToken: 'refresh123',
        expiresAt: 1234567890,
      });
    });

    it('should handle signIn errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(
        authService.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('signOut', () => {
    it('should signOut user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      });

      await authService.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle signOut errors', async () => {
      const mockError = { message: 'Logout failed' };
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: mockError
      });

      await expect(authService.signOut())
        .rejects.toThrow('Logout failed');
    });
  });

  describe('getUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.getUser();

      expect(result).toBe(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle no user found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.getUser();

      expect(result).toBe(null);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle auth errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      await expect(authService.getUser()).rejects.toThrow(ApiError);
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const result = authService.onAuthStateChange(mockCallback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(result).toBe(mockUnsubscribe);
    });
  });
});