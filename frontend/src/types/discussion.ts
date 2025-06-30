// 讨论类型枚举
export enum DiscussionType {
  SQUARE = "square",
  GROUP = "group"
}

// 讨论类型
export interface Discussion {
  id: number;
  title: string;
  content: string;
  discussion_type: DiscussionType;
  author_id: number;
  content_id?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  reply_count: number;
  author?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// 讨论创建类型
export interface DiscussionCreate {
  title: string;
  content: string;
  discussion_type: DiscussionType;
  content_id?: number;
  group_id?: number;
}

// 讨论更新类型
export interface DiscussionUpdate {
  title?: string;
  content?: string;
  is_pinned?: boolean;
}

// 评论类型
export interface Comment {
  id: number;
  content: string;
  author_id: number;
  discussion_id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

// 评论创建类型
export interface CommentCreate {
  content: string;
  discussion_id: number;
  parent_id?: number;
}

// 评论更新类型
export interface CommentUpdate {
  content?: string;
}
