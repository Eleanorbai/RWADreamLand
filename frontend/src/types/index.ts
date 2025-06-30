// 导出所有类型
export * from './user';
export * from './note';
export * from './content';
export * from './group';
export * from './discussion';
export * from './message';
export * from './blockchain';

// 通用响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 通用消息响应
export interface MessageResponse {
  message: string;
}

// 通用错误响应
export interface ErrorResponse {
  detail: string;
  message?: string;
}
