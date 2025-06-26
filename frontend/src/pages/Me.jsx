import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Me() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          setMsg("未登录或信息获取失败");
        });
    } else {
      setMsg("未登录");
    }
  }, []);

  if (msg) {
    return (
      <div className="text-center mt-10">
        <div className="mb-4 text-red-500">{msg}</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate("/login")}
        >
          去登录
        </button>
      </div>
    );
  }
  if (!user) return <div className="text-gray-500 text-center mt-10">加载中...</div>;
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">个人信息</h2>
      <div className="mb-2"><span className="font-semibold">用户名：</span>{user.username}</div>
      <div className="mb-2"><span className="font-semibold">姓名：</span>{user.full_name || "-"}</div>
    </div>
  );
} 