import { UserRole } from './auth.types';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  organizationId?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  organizationId?: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  organizationId?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UserFilters {
  role?: UserRole;
  organizationId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
