// 小组角色枚举
export enum GroupRole {
  MEMBER = "member",
  ADMIN = "admin",
  OWNER = "owner"
}

// 小组类型
export interface Group {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  max_members?: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  owner?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// 小组创建类型
export interface GroupCreate {
  name: string;
  description?: string;
  is_public?: boolean;
  max_members?: number;
}

// 小组更新类型
export interface GroupUpdate {
  name?: string;
  description?: string;
  is_public?: boolean;
  max_members?: number;
}

// 小组成员类型
export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: GroupRole;
  joined_at: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
    points: number;
  };
}

// 小组成员创建类型
export interface GroupMemberCreate {
  group_id: number;
  role?: GroupRole;
}
