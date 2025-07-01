import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../lib/api';
import { User, UserRole } from '../types/user';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GitBranch, Settings, BarChart3 } from 'lucide-react';

const roleDisplay = {
  user: '普通用户',
  reviewer: '内容审核员',
  community_manager: '社区管理员',
  admin: '超级管理员',
};

const roleOptions = [
  { value: 'user', label: '普通用户' },
  { value: 'reviewer', label: '内容审核员' },
  { value: 'community_manager', label: '社区管理员' },
  { value: 'admin', label: '超级管理员' },
];

export default function PermissionCenter() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [batchRole, setBatchRole] = useState<UserRole | ''>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers();
      setUsers(res);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    await userApi.updateUserRole(userId, newRole);
    loadUsers();
  };

  const handleBatchRoleChange = async () => {
    if (!batchRole || selected.length === 0) return;
    await Promise.all(selected.map(id => userApi.updateUserRole(id, batchRole as UserRole)));
    setSelected([]);
    setBatchRole('');
    loadUsers();
  };

  const toggleSelect = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* 管理导航 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">审核管理中心</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin')}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">用户权限</h3>
              <p className="text-sm text-gray-500 mt-1">管理用户角色和权限</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-green-50 border-green-200" onClick={() => navigate('/admin/contributions')}>
            <CardContent className="p-6 text-center">
              <GitBranch className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">贡献审核</h3>
              <p className="text-sm text-gray-500 mt-1">审核GitHub贡献记录</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => alert('功能开发中')}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">数据统计</h3>
              <p className="text-sm text-gray-500 mt-1">查看平台运营数据</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => alert('功能开发中')}>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">系统设置</h3>
              <p className="text-sm text-gray-500 mt-1">配置系统参数</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>用户权限管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <select
              value={batchRole}
              onChange={e => setBatchRole(e.target.value as UserRole)}
              className="border rounded px-2 py-1"
            >
              <option value="">批量分配角色</option>
              {roleOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button onClick={handleBatchRoleChange} disabled={!batchRole || selected.length === 0}>
              批量分配
            </Button>
            <Button variant="outline" onClick={loadUsers}>刷新</Button>
            <Button variant="secondary" onClick={() => alert('操作日志功能开发中')}>查看操作日志</Button>
          </div>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>用户名</th>
                  <th>角色</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} />
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <Badge>{roleDisplay[user.role]}</Badge>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={user.role === 'admin'}
                        className="border rounded px-2 py-1"
                      >
                        {roleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 