import axios from 'axios';
import { User, UserUpdate, UploadResponse } from '../types/user';
import { 
  Note, 
  NoteCreate, 
  NoteUpdate, 
  ReviewRequest, 
  ReviewRequestWithDetails,
  ReviewCreate,
  Review
} from '../types/note';
import { UserRole } from '../types/user';
import {
  Content,
  ContentCreate,
  ContentUpdate,
  Tag,
  LikeStatus
} from '../types/content';
import {
  Group,
  GroupCreate,
  GroupUpdate,
  GroupMember
} from '../types/group';
import {
  Discussion,
  DiscussionCreate,
  DiscussionUpdate,
  Comment,
  CommentCreate,
  CommentUpdate
} from '../types/discussion';
import {
  Message,
  MessageCreate,
  UnreadCount
} from '../types/message';
import {
  BlockchainRecord,
  PlatformStats
} from '../types/blockchain';
import {
  OpenProject,
  OpenProjectCreate,
  OpenProjectUpdate,
  GitHubContribution,
  ContributorProfile,
  ContributorProfileCreate,
  ContributorProfileUpdate,
  ContributorRanking,
  ProjectStats
} from '../types/opensource';
import { MessageResponse } from '../types';

// 配置axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
});

// 请求拦截器：自动添加认证头
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userApi = {
  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/me');
    return response.data;
  },

  // 更新用户信息
  updateProfile: async (data: UserUpdate): Promise<User> => {
    const response = await api.put('/me', data);
    return response.data;
  },

  // 上传头像
  uploadAvatar: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserRole: async (userId: number, newRole: UserRole): Promise<any> => {
    const response = await api.patch(`/users/${userId}/role`, { new_role: newRole });
    return response.data;
  },

  changePassword: async (data: { old_password: string; new_password: string }): Promise<any> => {
    const response = await api.put('/me/password', data);
    return response.data;
  },
};

// 笔记相关API
export const noteApi = {
  // 获取我的笔记列表
  getMyNotes: async (skip = 0, limit = 20): Promise<Note[]> => {
    const response = await api.get(`/notes/my?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 获取笔记详情
  getNote: async (noteId: number): Promise<Note> => {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  },

  // 创建笔记
  createNote: async (data: NoteCreate): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  // 更新笔记
  updateNote: async (noteId: number, data: NoteUpdate): Promise<Note> => {
    const response = await api.put(`/notes/${noteId}`, data);
    return response.data;
  },

  // 删除笔记
  deleteNote: async (noteId: number): Promise<void> => {
    await api.delete(`/notes/${noteId}`);
  },

  // 提交笔记审核
  submitForReview: async (noteId: number): Promise<ReviewRequest> => {
    const response = await api.post(`/notes/${noteId}/submit`);
    return response.data;
  },
};

// 审核相关API
export const reviewApi = {
  // 获取我的审核请求列表
  getMyReviewRequests: async (skip = 0, limit = 20): Promise<ReviewRequestWithDetails[]> => {
    const response = await api.get(`/review-requests/my?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 获取待审核列表（审核员）
  getReviewRequests: async (skip = 0, limit = 20): Promise<ReviewRequestWithDetails[]> => {
    const response = await api.get(`/review-requests?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 创建审核记录
  createReview: async (data: ReviewCreate): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
};

// 标签相关API
export const tagApi = {
  // 获取标签列表
  getTags: async (skip = 0, limit = 100): Promise<Tag[]> => {
    const response = await api.get(`/tags?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 创建标签
  createTag: async (data: { name: string; description?: string; color?: string }): Promise<Tag> => {
    const response = await api.post('/tags', data);
    return response.data;
  },
};

// 内容相关API
export const contentApi = {
  // 获取内容列表（广场）
  getContents: async (skip = 0, limit = 20, content_type?: string): Promise<Content[]> => {
    let url = `/contents?skip=${skip}&limit=${limit}`;
    if (content_type) {
      url += `&content_type=${content_type}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 获取我的内容列表
  getMyContents: async (skip = 0, limit = 20): Promise<Content[]> => {
    const response = await api.get(`/contents/my?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 获取内容详情
  getContent: async (contentId: number): Promise<Content> => {
    const response = await api.get(`/contents/${contentId}`);
    return response.data;
  },

  // 创建内容
  createContent: async (data: ContentCreate): Promise<Content> => {
    const response = await api.post('/contents', data);
    return response.data;
  },

  // 更新内容
  updateContent: async (contentId: number, data: ContentUpdate): Promise<Content> => {
    const response = await api.put(`/contents/${contentId}`, data);
    return response.data;
  },

  // 发布内容到广场
  publishContent: async (contentId: number): Promise<Content> => {
    const response = await api.post(`/contents/${contentId}/publish`);
    return response.data;
  },

  // 删除内容
  deleteContent: async (contentId: number): Promise<void> => {
    await api.delete(`/contents/${contentId}`);
  },

  // 点赞/取消点赞内容
  toggleLike: async (contentId: number): Promise<{ liked: boolean; message: string }> => {
    const response = await api.post(`/contents/${contentId}/like`);
    return response.data;
  },

  // 获取点赞状态
  getLikeStatus: async (contentId: number): Promise<LikeStatus> => {
    const response = await api.get(`/contents/${contentId}/like-status`);
    return response.data;
  },

  // 添加标签到内容
  addTag: async (contentId: number, tagId: number): Promise<MessageResponse> => {
    const response = await api.post(`/contents/${contentId}/tags/${tagId}`);
    return response.data;
  },

  // 从内容移除标签
  removeTag: async (contentId: number, tagId: number): Promise<MessageResponse> => {
    const response = await api.delete(`/contents/${contentId}/tags/${tagId}`);
    return response.data;
  },

  // 获取内容标签
  getContentTags: async (contentId: number): Promise<Tag[]> => {
    const response = await api.get(`/contents/${contentId}/tags`);
    return response.data;
  },
};

// 小组相关API
export const groupApi = {
  // 获取小组列表
  getGroups: async (skip = 0, limit = 20): Promise<Group[]> => {
    const response = await api.get(`/groups?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 获取我的小组列表
  getMyGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups/my');
    return response.data;
  },

  // 获取小组详情
  getGroup: async (groupId: number): Promise<Group> => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  // 创建小组
  createGroup: async (data: GroupCreate): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data;
  },

  // 更新小组
  updateGroup: async (groupId: number, data: GroupUpdate): Promise<Group> => {
    const response = await api.put(`/groups/${groupId}`, data);
    return response.data;
  },

  // 删除小组
  deleteGroup: async (groupId: number): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },

  // 获取小组成员
  getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  },

  // 加入小组
  joinGroup: async (groupId: number): Promise<GroupMember> => {
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data;
  },

  // 离开小组
  leaveGroup: async (groupId: number): Promise<MessageResponse> => {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data;
  },
};

// 讨论相关API
export const discussionApi = {
  // 获取讨论列表
  getDiscussions: async (contentId?: number, groupId?: number, skip = 0, limit = 20): Promise<Discussion[]> => {
    let url = `/discussions?skip=${skip}&limit=${limit}`;
    if (contentId) {
      url += `&content_id=${contentId}`;
    }
    if (groupId) {
      url += `&group_id=${groupId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // 获取讨论详情
  getDiscussion: async (discussionId: number): Promise<Discussion> => {
    const response = await api.get(`/discussions/${discussionId}`);
    return response.data;
  },

  // 创建讨论
  createDiscussion: async (data: DiscussionCreate): Promise<Discussion> => {
    const response = await api.post('/discussions', data);
    return response.data;
  },

  // 更新讨论
  updateDiscussion: async (discussionId: number, data: DiscussionUpdate): Promise<Discussion> => {
    const response = await api.put(`/discussions/${discussionId}`, data);
    return response.data;
  },

  // 删除讨论
  deleteDiscussion: async (discussionId: number): Promise<void> => {
    await api.delete(`/discussions/${discussionId}`);
  },

  // 获取讨论评论
  getComments: async (discussionId: number, skip = 0, limit = 20): Promise<Comment[]> => {
    const response = await api.get(`/discussions/${discussionId}/comments?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// 评论相关API
export const commentApi = {
  // 创建评论
  createComment: async (data: CommentCreate): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  // 更新评论
  updateComment: async (commentId: number, data: CommentUpdate): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // 删除评论
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

// 消息相关API
export const messageApi = {
  // 获取消息列表
  getMessages: async (skip = 0, limit = 20): Promise<Message[]> => {
    const response = await api.get(`/messages?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 发送消息
  sendMessage: async (data: MessageCreate): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // 标记消息为已读
  markAsRead: async (messageId: number): Promise<Message> => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // 获取未读消息数量
  getUnreadCount: async (): Promise<UnreadCount> => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },
};

// 区块链记录相关API
export const blockchainApi = {
  // 获取区块链记录
  getRecords: async (skip = 0, limit = 20): Promise<BlockchainRecord[]> => {
    const response = await api.get(`/blockchain-records?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

// 统计数据相关API
export const statsApi = {
  // 获取平台统计数据
  getPlatformStats: async (): Promise<PlatformStats> => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// 开源项目相关API
export const openSourceApi = {
  // 开源项目管理
  createProject: async (project: OpenProjectCreate): Promise<OpenProject> => {
    const response = await api.post('/open-projects', project);
    return response.data;
  },

  getProjects: async (skip = 0, limit = 100, isActive?: boolean): Promise<OpenProject[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (isActive !== undefined) {
      params.append('is_active', isActive.toString());
    }
    const response = await api.get(`/open-projects?${params}`);
    return response.data;
  },

  getProject: async (projectId: number): Promise<OpenProject> => {
    const response = await api.get(`/open-projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId: number, project: OpenProjectUpdate): Promise<OpenProject> => {
    const response = await api.put(`/open-projects/${projectId}`, project);
    return response.data;
  },

  deleteProject: async (projectId: number): Promise<MessageResponse> => {
    const response = await api.delete(`/open-projects/${projectId}`);
    return response.data;
  },

  // GitHub贡献管理
  getContributions: async (
    projectId?: number,
    userId?: number,
    status?: string,
    skip = 0,
    limit = 100
  ): Promise<GitHubContribution[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    if (projectId) params.append('project_id', projectId.toString());
    if (userId) params.append('user_id', userId.toString());
    if (status) params.append('status', status);
    
    const response = await api.get(`/github-contributions?${params}`);
    return response.data;
  },

  getContribution: async (contributionId: number): Promise<GitHubContribution> => {
    const response = await api.get(`/github-contributions/${contributionId}`);
    return response.data;
  },

  acceptContribution: async (contributionId: number, userId?: number): Promise<GitHubContribution> => {
    const data = userId ? { user_id: userId } : {};
    const response = await api.put(`/github-contributions/${contributionId}/accept`, data);
    return response.data;
  },

  syncContributions: async (projectId: number): Promise<MessageResponse> => {
    const response = await api.post(`/github/sync/${projectId}`);
    return response.data;
  },

  // 贡献者管理
  createContributorProfile: async (profile: ContributorProfileCreate): Promise<ContributorProfile> => {
    const response = await api.post('/contributor-profile', profile);
    return response.data;
  },

  getMyContributorProfile: async (): Promise<ContributorProfile> => {
    const response = await api.get('/contributor-profile');
    return response.data;
  },

  updateMyContributorProfile: async (profile: ContributorProfileUpdate): Promise<ContributorProfile> => {
    const response = await api.put('/contributor-profile', profile);
    return response.data;
  },

  getContributorRankings: async (limit = 50): Promise<ContributorRanking[]> => {
    const response = await api.get(`/contributors/rankings?limit=${limit}`);
    return response.data;
  },

  getUserContributions: async (userId: number, skip = 0, limit = 100): Promise<GitHubContribution[]> => {
    const response = await api.get(`/contributors/${userId}/contributions?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // 项目统计
  getProjectStats: async (projectId: number): Promise<ProjectStats> => {
    const response = await api.get(`/open-projects/${projectId}/stats`);
    return response.data;
  },
};

// 导出默认api实例
export default api;
