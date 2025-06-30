// 内容类型枚举
export enum ContentType {
  CASE_STUDY = "case_study",
  STUDY_NOTES = "study_notes", 
  BUSINESS_MODEL = "business_model"
}

// 内容状态枚举
export enum ContentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  usage_count: number;
}

// 内容类型
export interface Content {
  id: number;
  title: string;
  content: string;
  content_type: ContentType;
  description?: string;
  author_id: number;
  note_id?: number;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
  view_count: number;
  like_count: number;
  author?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  tags?: Tag[];
}

// 内容创建类型
export interface ContentCreate {
  title: string;
  content: string;
  content_type: ContentType;
  description?: string;
  note_id?: number;
}

// 内容更新类型
export interface ContentUpdate {
  title?: string;
  content?: string;
  content_type?: ContentType;
  description?: string;
}

// 内容点赞状态
export interface LikeStatus {
  liked: boolean;
}

// 内容标签关联
export interface ContentTag {
  id: number;
  content_id: number;
  tag_id: number;
  created_at: string;
}
