import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", form.username);
      params.append("password", form.password);
      // FastAPI OAuth2PasswordRequestForm 需要 x-www-form-urlencoded
      const res = await axios.post("http://localhost:8000/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      localStorage.setItem("token", res.data.access_token);
      setMsg("登录成功，正在跳转...");
      setTimeout(() => {
        navigate("/me");
      }, 1000); // 1秒后跳转
    } catch (err) {
      setMsg(err.response?.data?.detail || "登录失败");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>登录</h2>
      <input name="username" placeholder="用户名" value={form.username} onChange={handleChange} required />
      <input name="password" type="password" placeholder="密码" value={form.password} onChange={handleChange} required />
      <button type="submit">登录</button>
      <div>{msg}</div>
    </form>
  );
}