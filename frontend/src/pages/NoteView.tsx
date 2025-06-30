import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Send,
  Calendar,
  User,
  FileText,
  Star
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

import { Note } from '../types/note';
import { noteApi } from '../lib/api';

interface NoteViewProps {}

export default function NoteView({}: NoteViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const noteData = await noteApi.getNote(parseInt(id));
      setNote(noteData);
    } catch (err: any) {
      toast({
        title: '加载失败',
        description: err.response?.data?.detail || '获取笔记失败',
        variant: 'destructive',
      });
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (note) {
      navigate(`/notes/${note.id}/edit`);
    }
  };

  const handleSubmitForReview = async () => {
    if (!note) return;

    try {
      await noteApi.submitForReview(note.id);
      setNote({ ...note, is_submitted: true });
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

  const handleDownload = () => {
    if (!note) return;
    
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">笔记未找到</CardTitle>
            <CardDescription className="text-center">
              您要查看的笔记不存在或已被删除
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/notes')}>
              返回笔记列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回笔记列表
            </Button>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>

              {!note.is_submitted && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmitForReview}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    提交审核
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 笔记头部信息 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {note.title}
                  </CardTitle>
                  
                  {/* 元信息 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      创建于 {formatDate(note.created_at)}
                    </div>
                    
                    {note.updated_at !== note.created_at && (
                      <div className="flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        更新于 {formatDate(note.updated_at)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 状态标识 */}
                <div className="flex flex-col items-end space-y-2">
                  {note.is_submitted && (
                    <Badge className="bg-blue-100 text-blue-800">
                      已提交审核
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 笔记内容 */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* 提示信息 */}
          {note.is_submitted && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center text-blue-800">
                  <Send className="w-5 h-5 mr-2" />
                  <div>
                    <p className="font-medium">此笔记已提交审核</p>
                    <p className="text-sm text-blue-600">
                      审核通过后您将获得额外积分奖励
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 底部操作栏 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/notes')}
            >
              返回笔记列表
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
