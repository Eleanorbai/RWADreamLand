import React, { useEffect, useState } from 'react';
import { userApi } from '../lib/api';
import { User, UserRole } from '../types/user';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>权限管理中心</CardTitle>
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