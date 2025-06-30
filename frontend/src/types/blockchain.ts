// 区块链操作枚举
export enum BlockchainAction {
  POINTS_REWARD = "points_reward",
  CONTENT_PUBLISH = "content_publish",
  CONTRIBUTION_RECORD = "contribution_record"
}

// 区块链记录类型
export interface BlockchainRecord {
  id: number;
  user_id: number;
  content_id?: number;
  action: BlockchainAction;
  description: string;
  points_amount?: number;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: number;
  created_at: string;
  confirmed_at?: string;
  is_confirmed: boolean;
  user?: {
    id: number;
    username: string;
    full_name?: string;
  };
  content?: {
    id: number;
    title: string;
    content_type: string;
  };
}

// 区块链记录创建类型
export interface BlockchainRecordCreate {
  action: BlockchainAction;
  description: string;
  points_amount?: number;
  content_id?: number;
  transaction_hash?: string;
}

// 平台统计数据
export interface PlatformStats {
  total_users: number;
  total_contents: number;
  total_groups: number;
  total_discussions: number;
  total_points_distributed: number;
  active_users_today: number;
  active_users_week: number;
  popular_tags: Array<{
    tag_name: string;
    usage_count: number;
  }>;
}
