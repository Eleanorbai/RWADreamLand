// 用户角色枚举
export enum UserRole {
  USER = "user",
  REVIEWER = "reviewer",
  COMMUNITY_MANAGER = "community_manager",
  ADMIN = "admin"
}

// 用户类型定义
export interface User {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  points: number;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 用户更新类型
export interface UserUpdate {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 上传响应类型
export interface UploadResponse {
  filename: string;
  url: string;
}
