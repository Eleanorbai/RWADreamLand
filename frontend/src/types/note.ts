import { User } from './user';

// 审核状态枚举
export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved", 
  REJECTED = "rejected",
  REVISION_REQUIRED = "revision_required"
}

// 笔记基础类型
export interface Note {
  id: number;
  title: string;
  content: string;
  author_id: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

// 带作者信息的笔记
export interface NoteWithAuthor extends Note {
  author?: User;
}

// 笔记创建类型
export interface NoteCreate {
  title: string;
  content: string;
}

// 笔记更新类型
export interface NoteUpdate {
  title?: string;
  content?: string;
}

// 审核请求类型
export interface ReviewRequest {
  id: number;
  note_id: number;
  author_id: number;
  status: ReviewStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: number;
  review_comment?: string;
}

// 带详细信息的审核请求
export interface ReviewRequestWithDetails extends ReviewRequest {
  note?: Note;
  author?: User;
  reviewer?: User;
}

// 审核记录类型
export interface Review {
  id: number;
  review_request_id: number;
  reviewer_id: number;
  status: ReviewStatus;
  comment?: string;
  reviewed_at: string;
}

// 审核创建类型
export interface ReviewCreate {
  review_request_id: number;
  status: ReviewStatus;
  comment?: string;
}

// 审核状态显示名称
export const reviewStatusNames: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: '待审核',
  [ReviewStatus.APPROVED]: '已通过',
  [ReviewStatus.REJECTED]: '已拒绝',
  [ReviewStatus.REVISION_REQUIRED]: '需要修改',
};

// 审核状态颜色
export const reviewStatusColors: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ReviewStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ReviewStatus.REJECTED]: 'bg-red-100 text-red-800',
  [ReviewStatus.REVISION_REQUIRED]: 'bg-orange-100 text-orange-800',
};
