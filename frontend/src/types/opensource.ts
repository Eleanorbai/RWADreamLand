// 开源项目相关类型定义

export enum ContributorType {
  INDIVIDUAL = "individual",
  ORGANIZATION = "organization"
}

export enum ContributionType {
  BUG_REPORT = "bug_report",
  FEATURE_REQUEST = "feature_request", 
  DOCUMENTATION = "documentation",
  CODE_CONTRIBUTION = "code_contribution",
  CRITICAL_FIX = "critical_fix",
  UI_UX_IMPROVEMENT = "ui_ux_improvement",
  TESTING = "testing",
  OTHER = "other"
}

export enum ContributionStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  IN_PROGRESS = "in_progress"
}

export enum VerificationStatus {
  UNVERIFIED = "unverified",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

// 开源项目类型
export interface OpenProject {
  id: number;
  name: string;
  github_repo: string;
  description?: string;
  contract_address?: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface OpenProjectCreate {
  name: string;
  github_repo: string;
  description?: string;
  contract_address?: string;
}

export interface OpenProjectUpdate {
  name?: string;
  description?: string;
  contract_address?: string;
  is_public?: boolean;
}

// GitHub贡献记录类型
export interface GitHubContribution {
  id: number;
  project_id: number;
  user_id?: number;
  github_username: string;
  issue_number: number;
  issue_title: string;
  issue_url: string;
  contribution_type: ContributionType;
  contribution_points: number;
  status: ContributionStatus;
  github_created_at: string;
  accepted_at?: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at?: string;
  project?: OpenProject;
  user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface GitHubContributionCreate {
  project_id: number;
  github_username: string;
  issue_number: number;
  issue_title: string;
  issue_url: string;
  contribution_type: ContributionType;
  contribution_points: number;
  github_created_at: string;
}

// 贡献者资料类型
export interface ContributorProfile {
  id: number;
  user_id: number;
  github_username: string;
  contributor_type: ContributorType;
  organization_name?: string;
  verification_status: VerificationStatus;
  total_contributions: number;
  total_points: number;
  reputation_score: number;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

export interface ContributorProfileCreate {
  github_username: string;
  contributor_type: ContributorType;
  organization_name?: string;
}

export interface ContributorProfileUpdate {
  contributor_type?: ContributorType;
  organization_name?: string;
  verification_status?: VerificationStatus;
}

// 项目统计类型
export interface ProjectStats {
  project_id: number;
  total_contributions: number;
  total_contributors: number;
  total_points: number;
  contribution_types: Record<string, number>;
  top_contributors: Array<{
    user_id: number;
    github_username: string;
    points: number;
    contributions: number;
  }>;
}

// 贡献者排行榜类型
export interface ContributorRanking {
  user_id: number;
  github_username: string;
  total_points: number;
  total_contributions: number;
  reputation_score: number;
  rank: number;
  user?: {
    id: number;
    username: string;
    full_name?: string;
  };
}

// 贡献类型配置
export const contributionTypeLabels: Record<ContributionType, string> = {
  [ContributionType.BUG_REPORT]: "Bug报告",
  [ContributionType.FEATURE_REQUEST]: "功能建议",
  [ContributionType.DOCUMENTATION]: "文档完善",
  [ContributionType.CODE_CONTRIBUTION]: "代码贡献",
  [ContributionType.CRITICAL_FIX]: "关键修复",
  [ContributionType.UI_UX_IMPROVEMENT]: "UI/UX改进",
  [ContributionType.TESTING]: "测试相关",
  [ContributionType.OTHER]: "其他"
};

export const contributionStatusLabels: Record<ContributionStatus, string> = {
  [ContributionStatus.PENDING]: "待处理",
  [ContributionStatus.ACCEPTED]: "已接受",
  [ContributionStatus.REJECTED]: "已拒绝",
  [ContributionStatus.IN_PROGRESS]: "处理中"
};

export const contributorTypeLabels: Record<ContributorType, string> = {
  [ContributorType.INDIVIDUAL]: "个人",
  [ContributorType.ORGANIZATION]: "企业/组织"
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: "未验证",
  [VerificationStatus.PENDING]: "待验证",
  [VerificationStatus.VERIFIED]: "已验证",
  [VerificationStatus.REJECTED]: "验证失败"
};

// 积分配置
export const contributionPointsConfig: Record<ContributionType, number> = {
  [ContributionType.BUG_REPORT]: 10,
  [ContributionType.FEATURE_REQUEST]: 15,
  [ContributionType.DOCUMENTATION]: 20,
  [ContributionType.CODE_CONTRIBUTION]: 50,
  [ContributionType.CRITICAL_FIX]: 100,
  [ContributionType.UI_UX_IMPROVEMENT]: 25,
  [ContributionType.TESTING]: 15,
  [ContributionType.OTHER]: 5
};

// 项目成员类型
export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
    points?: number;
  };
  joined_at?: string;
}

// 项目邀请类型
export interface ProjectInvite {
  id: number;
  project_id: number;
  inviter_id: number;
  invitee_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  inviter?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  invitee?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// 项目标签类型
export interface ProjectTag {
  id: number;
  name: string;
}

// 项目-标签多对多关联
export interface ProjectTagLink {
  project_id: number;
  tag_id: number;
}
