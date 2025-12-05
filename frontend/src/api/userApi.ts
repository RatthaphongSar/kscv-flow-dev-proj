// frontend/src/api/userApi.ts

import { api } from '../utils/api.js';

export interface UserProfile {
  id: string;
  username: string;
  fullname?: string;
  email?: string;
  phone?: string;
  role: string;
  year: number;
  major: string;
  studentId?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvisorInfo {
  id: string;
  email?: string;
  phone?: string;
  office?: string;
  bio?: string;
  fullname?: string;
}

export const userApi = {
  /**
   * Get current user profile with advisor info
   */
  async getProfile(): Promise<{ user: UserProfile; advisor?: AdvisorInfo }> {
    const response: any = await api('/users/profile', {
      method: 'GET'
    });
    return response?.data || {};
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response: any = await api('/users/profile', {
      method: 'PATCH',
      body: updates
    });
    return response?.data;
  },

  /**
   * Get me (current user info)
   */
  async getMe(): Promise<UserProfile> {
    const response: any = await api('/users/me', {
      method: 'GET'
    });
    return response?.data;
  },

  /**
   * List all users (with optional filters)
   */
  async listUsers(filters?: {
    role?: string;
    year?: number;
    major?: string;
  }): Promise<UserProfile[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.major) params.append('major', filters.major);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response: any = await api(`/users${query}`, {
      method: 'GET'
    });
    return response?.data || [];
  }
};
