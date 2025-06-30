// 消息类型
export interface Message {
  id: number;
  title: string;
  content: string;
  message_type: string;
  sender_id?: number;
  receiver_id: number;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// 消息创建类型
export interface MessageCreate {
  title: string;
  content: string;
  message_type?: string;
  receiver_id: number;
}

// 消息更新类型
export interface MessageUpdate {
  is_read?: boolean;
}

// 未读消息数量
export interface UnreadCount {
  unread_count: number;
}
