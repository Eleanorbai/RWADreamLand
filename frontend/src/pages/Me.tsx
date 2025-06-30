import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Star, 
  BookOpen, 
  Upload, 
  Settings,
  Camera,
  Award,
  FileText,
  LogOut,
  Send
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { User, UserRole } from '../types/user';
import { userApi } from '../lib/api';
import { noteApi } from '../lib/api';
import { getRoleDisplayName, getRoleColorClass } from '../lib/roleUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MePageProps {}

export default function Me({}: MePageProps) {
  console.log('Me component rendered');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState<{ id: number | null, title: string, content: string }>({ id: null, title: '', content: '' });
  const [noteMsg, setNoteMsg] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const userData = await userApi.getCurrentUser();
      console.log('userData:', userData);
      setUser(userData);
    } catch (err: any) {
      console.log('getCurrentUser error:', err);
      const errorMessage = err.response?.data?.detail || '获取用户信息失败';
      setError(errorMessage);
      
      // 如果是认证错误，跳转到登录页
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: '文件类型不支持',
        description: '请选择 JPEG、PNG、GIF 或 WebP 格式的图片',
        variant: 'destructive',
      });
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const uploadResult = await userApi.uploadAvatar(file);
      
      // 更新用户头像URL
      if (user) {
        setUser({
          ...user,
          avatar_url: uploadResult.url
        });
      }

      toast({
        title: '头像上传成功',
        description: '您的头像已更新',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || '头像上传失败';
      toast({
        title: '上传失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const navigateToNotes = () => {
    navigate('/notes');
  };

  const getAvatarFallback = (username?: string) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  // 获取我的笔记
  useEffect(() => {
    console.log('user:', user);
    if (!user) return;
    setNotesLoading(true);
    noteApi.getMyNotes()
      .then(setNotes)
      .finally(() => setNotesLoading(false));
  }, [user, editMode]);

  // 新建或编辑笔记
  const handleSaveNote = async () => {
    if (!currentNote.title.trim()) {
      setNoteMsg('标题不能为空');
      return;
    }
    try {
      if (currentNote.id) {
        await noteApi.updateNote(currentNote.id, {
          title: currentNote.title,
          content: currentNote.content
        });
      } else {
        await noteApi.createNote({
          title: currentNote.title,
          content: currentNote.content
        });
      }
      setEditMode(false);
      setCurrentNote({ id: null, title: '', content: '' });
      setNoteMsg('保存成功！');
      setTimeout(() => setNoteMsg(''), 1500);
    } catch {
      setNoteMsg('保存失败');
    }
  };

  // 删除笔记
  const handleDeleteNote = async (id: number) => {
    if (!window.confirm('确定要删除这条笔记吗？')) return;
    try {
      await noteApi.deleteNote(id);
      setNoteMsg('删除成功！');
      setEditMode(false);
      setCurrentNote({ id: null, title: '', content: '' });
      setTimeout(() => setNoteMsg(''), 1500);
      setNotes(notes.filter(note => note.id !== id));
    } catch {
      setNoteMsg('删除失败');
    }
  };

  // 编辑笔记
  const handleEditNote = (note: any) => {
    setEditMode(true);
    setCurrentNote({ id: note.id, title: note.title, content: note.content });
  };

  // 新建笔记
  const handleNewNote = () => {
    setEditMode(true);
    setCurrentNote({ id: null, title: '', content: '' });
  };

  const handleSubmitForReview = async (noteId: number) => {
    try {
      await noteApi.submitForReview(noteId);
      toast({ title: '已提交审核', description: '笔记已申请发布，等待审核员处理', variant: 'default' });
      // 刷新笔记列表
      loadUserData();
    } catch (err: any) {
      toast({ title: '提交失败', description: err?.response?.data?.detail || '请重试', variant: 'destructive' });
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">出错了</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/login')} className="mr-2">
              去登录
            </Button>
            <Button variant="outline" onClick={loadUserData}>
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
          <p className="text-gray-600 mt-2">管理您的个人信息和笔记</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：用户信息卡片 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息卡片 */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={user.avatar_url} 
                      alt={user.username}
                    />
                    <AvatarFallback className="text-2xl">
                      {getAvatarFallback(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* 头像上传按钮 */}
                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    ) : (
                      <Camera className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  
                  {/* 隐藏的文件输入 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <CardDescription>
                  {user.full_name || '暂未设置姓名'}
                </CardDescription>
                
                {/* 角色标识 */}
                <div className="flex justify-center mt-3">
                  <Badge className={getRoleColorClass(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 积分显示 */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-medium text-gray-700">积分</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">
                    {user.points}
                  </span>
                </div>

                {/* 邮箱信息 */}
                {user.email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">邮箱：</span>
                    {user.email}
                  </div>
                )}

                {/* 注册时间 */}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">注册时间：</span>
                  {new Date(user.created_at).toLocaleDateString('zh-CN')}
                </div>
              </CardContent>
            </Card>

            {/* 设置按钮 */}
            <Card>
              <CardContent className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  个人设置
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：功能模块 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人笔记本模块 */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <BookOpen className="w-6 h-6 mr-3" />
                  个人笔记本
                </CardTitle>
                <CardDescription className="text-blue-600">
                  创建、编辑和管理您的Markdown笔记，分享您的学习心得
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 笔记操作区块 */}
                <div className="flex justify-between items-center mb-4">
                  <Button onClick={handleNewNote} variant="default">
                    新建笔记
                  </Button>
                </div>
                {/* 编辑/新建笔记区块 */}
                {editMode && (
                  <div className="mb-8 p-6 bg-white rounded shadow border border-blue-200">
                    <h3 className="text-lg font-semibold mb-2">{currentNote.id ? '编辑笔记' : '新建笔记'}</h3>
                    <input
                      className="block w-full mb-4 px-3 py-2 border rounded"
                      placeholder="请输入标题"
                      value={currentNote.title}
                      onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })}
                    />
                    <textarea
                      className="block w-full mb-4 px-3 py-2 border rounded"
                      placeholder="请输入内容"
                      value={currentNote.content}
                      onChange={e => setCurrentNote({ ...currentNote, content: e.target.value })}
                      rows={8}
                    />
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentNote.content}</ReactMarkdown>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={handleSaveNote} variant="default">保存</Button>
                      <Button variant="outline" onClick={() => { setEditMode(false); setCurrentNote({ id: null, title: '', content: '' }); }}>取消</Button>
                    </div>
                    {noteMsg && <div className="mt-2 text-center text-pink-500">{noteMsg}</div>}
                  </div>
                )}
                {/* 笔记列表区块 */}
                {notesLoading ? (
                  <div className="text-center text-gray-400 py-8">加载中...</div>
                ) : notes.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">暂无笔记，快去新建一条吧！</div>
                ) : (
                  <ul className="space-y-4">
                    {notes.map(note => (
                      <li key={note.id} className="p-4 bg-blue-50 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-bold text-blue-700">{note.title}</div>
                          <div className="text-gray-500 text-sm mt-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {note.content?.slice(0, 100) + (note.content?.length > 100 ? '...' : '')}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-2 mt-2 md:mt-0">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditNote(note)}>编辑</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteNote(note.id)}>删除</Button>
                          </div>
                          <Button
                            size="sm"
                            variant={note.is_submitted ? "secondary" : "outline"}
                            className={
                              note.is_submitted
                                ? "mt-2 md:mt-0 md:ml-2 border-green-400 text-green-700 bg-green-50 cursor-not-allowed"
                                : "mt-2 md:mt-0 md:ml-2 border-dashed border-blue-400 text-blue-700 hover:bg-blue-100 hover:border-blue-600"
                            }
                            disabled={note.is_submitted}
                            onClick={() => !note.is_submitted && handleSubmitForReview(note.id)}
                          >
                            <Send className={`w-4 h-4 mr-1 ${note.is_submitted ? "text-green-500" : "text-blue-500"}`} />
                            {note.is_submitted ? "已提交审核" : "申请发布"}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* 审核员专用模块 */}
            {(user.role === UserRole.REVIEWER || user.role === UserRole.ADMIN) && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Award className="w-6 h-6 mr-3" />
                    审核管理
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    审核用户提交的笔记和材料
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/review')}
                    className="w-full h-12 bg-green-600 hover:bg-green-700"
                  >
                    查看待审核材料
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 管理员专用模块 */}
            {user.role === UserRole.ADMIN && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <UserIcon className="w-6 h-6 mr-3" />
                    系统管理
                  </CardTitle>
                  <CardDescription className="text-red-600">
                    管理用户和系统设置
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/admin')}
                    className="w-full h-12 bg-red-600 hover:bg-red-700"
                  >
                    系统管理面板
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 统计信息 */}
            <Card>
              <CardHeader>
                <CardTitle>我的统计</CardTitle>
                <CardDescription>
                  查看您的学习和贡献统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
                    <div className="text-sm text-gray-600">笔记数量</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{notes.filter(n => n.is_submitted).length}</div>
                    <div className="text-sm text-gray-600">提交审核</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">-</div>
                    <div className="text-sm text-gray-600">通过审核</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{user.points}</div>
                    <div className="text-sm text-gray-600">总积分</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
