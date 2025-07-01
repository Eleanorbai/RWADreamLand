import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
        // 假设有token，后端 /me 返回当前用户
        const res = await axios.get("/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 退出登录
  const logout = () => {
    setUser(null);
    // 清除token等
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};