import React, { useEffect, useRef, useState } from 'react';
import { userApi } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/hooks/useUser";

export default function Settings() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 密码修改相关
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const { user, loading } = useUser();

  useEffect(() => {
    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setAvatarUrl(user.avatar_url ? 'http://localhost:8000' + user.avatar_url : '');
  }, [user]);

  // 头像上传
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast({ title: '文件类型不支持', description: '请选择图片文件', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: '文件过大', description: '图片不能超过10MB', variant: 'destructive' });
      return;
    }
    try {
      const res = await userApi.uploadAvatar(file);
      setAvatarUrl('http://localhost:8000' + res.url + '?t=' + Date.now());
      toast({ title: '头像上传成功', description: '头像已更新' });
    } catch {
      toast({ title: '上传失败', description: '请重试', variant: 'destructive' });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 保存基本信息
  const handleSave = async () => {
    try {
      await userApi.updateProfile({ full_name: fullName, email, avatar_url: avatarUrl });
      toast({ title: '保存成功', description: '个人信息已更新' });
    } catch {
      toast({ title: '保存失败', description: '请重试', variant: 'destructive' });
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: '请填写完整', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: '两次新密码不一致', variant: 'destructive' });
      return;
    }
    setPwdLoading(true);
    try {
      // 假设有 userApi.changePassword({ old_password, new_password })
      await userApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast({ title: '密码修改成功' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({ title: '密码修改失败', description: err?.response?.data?.detail || '请重试', variant: 'destructive' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">加载中...</div>;

  console.log('avatarUrl:', avatarUrl);

  return (
    <div className="max-w-md mx-auto py-8 space-y-8">
      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>个人设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl} alt="avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" onClick={triggerFileInput}>上传头像</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fullName">昵称</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="请输入昵称"
              />
            </div>
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                type="email"
              />
            </div>
            <Button className="w-full mt-4" onClick={handleSave}>
              保存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 密码修改卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="oldPwd">当前密码</Label>
              <Input
                id="oldPwd"
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="请输入当前密码"
              />
            </div>
            <div>
              <Label htmlFor="newPwd">新密码</Label>
              <Input
                id="newPwd"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
              />
            </div>
            <div>
              <Label htmlFor="confirmPwd">确认新密码</Label>
              <Input
                id="confirmPwd"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
              />
            </div>
            <Button className="w-full mt-4" onClick={handleChangePassword} disabled={pwdLoading}>
              {pwdLoading ? '保存中...' : '修改密码'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}