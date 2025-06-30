import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Send,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import { Note } from '../types/note';
import { noteApi } from '../lib/api';

interface NotesPageProps {}

export default function Notes({}: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesList = await noteApi.getMyNotes();
      setNotes(notesList);
    } catch (err: any) {
      toast({
        title: '加载失败',
        description: err.response?.data?.detail || '获取笔记列表失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('确定要删除这篇笔记吗？此操作不可恢复。')) {
      return;
    }

    try {
      setDeleting(noteId);
      await noteApi.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast({
        title: '删除成功',
        description: '笔记已被删除',
      });
    } catch (err: any) {
      toast({
        title: '删除失败',
        description: err.response?.data?.detail || '删除笔记失败',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmitForReview = async (noteId: number) => {
    try {
      await noteApi.submitForReview(noteId);
      // 更新笔记状态
      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, is_submitted: true }
          : note
      ));
      toast({
        title: '提交成功',
        description: '笔记已提交审核，您将获得积分奖励',
      });
    } catch (err: any) {
      toast({
        title: '提交失败',
        description: err.response?.data?.detail || '提交审核失败',
        variant: 'destructive',
      });
    }
  };

  // 过滤笔记
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取内容预览
  const getContentPreview = (content: string, maxLength = 100) => {
    // 移除Markdown语法
    const plainText = content.replace(/[#*_`\[\]()]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">我的笔记</h1>
              <p className="text-gray-600 mt-2">
                管理您的Markdown笔记，分享学习心得
              </p>
            </div>
            <Button 
              onClick={() => navigate('/notes/new')}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              新建笔记
            </Button>
          </div>

          {/* 搜索栏 */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索笔记..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredNotes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '没有找到匹配的笔记' : '还没有笔记'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? '尝试使用不同的关键词搜索'
                  : '开始创建您的第一篇笔记吧'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/notes/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建笔记
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* 笔记列表 */}
        {!loading && filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">
                      {note.title}
                    </CardTitle>
                    {note.is_submitted && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        已提交
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* 内容预览 */}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {getContentPreview(note.content)}
                  </p>

                  {/* 日期信息 */}
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(note.updated_at)}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/notes/${note.id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/notes/${note.id}/edit`)}
                      disabled={note.is_submitted}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>

                    {!note.is_submitted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubmitForReview(note.id)}
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleting === note.id}
                    >
                      {deleting === note.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 底部操作区 */}
        {!loading && filteredNotes.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              共 {filteredNotes.length} 篇笔记
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
