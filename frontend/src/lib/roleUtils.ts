import { UserRole } from '../types/user';

// 角色显示名称映射
export const roleDisplayNames: Record<UserRole, string> = {
  [UserRole.USER]: '普通用户',
  [UserRole.ADMIN]: '超级管理员',
  [UserRole.REVIEWER]: '材料审核员',
  [UserRole.COMMUNITY_MANAGER]: '社区管理员',
};

// 角色颜色映射
export const roleColors: Record<UserRole, string> = {
  [UserRole.USER]: 'bg-blue-100 text-blue-800',
  [UserRole.ADMIN]: 'bg-red-100 text-red-800', 
  [UserRole.REVIEWER]: 'bg-green-100 text-green-800',
  [UserRole.COMMUNITY_MANAGER]: 'bg-purple-100 text-purple-800',
};

// 获取角色显示名称
export const getRoleDisplayName = (role: UserRole): string => {
  return roleDisplayNames[role] || '未知角色';
};

// 获取角色颜色样式
export const getRoleColorClass = (role: UserRole): string => {
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

// 检查是否有管理权限
export const hasAdminPermissions = (role: UserRole): boolean => {
  return role === UserRole.ADMIN;
};

// 检查是否有审核权限
export const hasReviewPermissions = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || role === UserRole.REVIEWER;
};
