import React, { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../lib/api";

// 定义用户类型
export interface User {
  id: number;
  username: string;
  full_name?: string;
  email?: string;
  role?: string;
  // ...其它字段
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: false,
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 自动获取当前用户信息（如有token）
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        // 使用配置好的userApi实例，会自动添加认证token
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser(null);
        // 如果token无效，清除本地存储
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 退出登录
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
