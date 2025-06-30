import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/register", form);
      setMsg("注册成功，请去登录！");
    } catch (err) {
      setMsg(err.response?.data?.detail || "注册失败");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-40 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">注册</h2>
      <input
        name="username"
        placeholder="用户名"
        value={form.username}
        onChange={handleChange}
        required
        className="block w-full mb-4 px-3 py-2 border rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="密码"
        value={form.password}
        onChange={handleChange}
        required
        className="block w-full mb-4 px-3 py-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">注册</button>
      <div className="mt-4 text-center text-gray-600">{msg}</div>
    </form>
  );
}