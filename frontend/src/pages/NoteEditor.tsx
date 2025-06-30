import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Save, 
  Eye, 
  Edit3, 
  ArrowLeft, 
  Send,
  Download,
  FileText
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { Note, NoteCreate, NoteUpdate } from '../types/note';
import { noteApi } from '../lib/api';

interface NoteEditorProps {}

export default function NoteEditor({}: NoteEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const isEditing = Boolean(id);
  const isSubmitted = note?.is_submitted || false;

  useEffect(() => {
    if (isEditing) {
      loadNote();
    } else {
      // 新建笔记时设置默认内容
      setTitle('');
      setContent(`# 新笔记

在这里开始编写您的笔记...

## 使用说明

您可以使用Markdown语法来格式化文本：

- **粗体文本**
- *斜体文本*
- [链接](https://example.com)
- \`代码\`

### 代码块

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

### 列表

1. 有序列表项1
2. 有序列表项2

- 无序列表项1
- 无序列表项2

### 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |

`);
    }
  }, [id]);

  const loadNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const noteData = await noteApi.getNote(parseInt(id));
      setNote(noteData);
      setTitle(noteData.title);
      setContent(noteData.content);
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

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入笔记标题',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: '内容不能为空', 
        description: '请输入笔记内容',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && note) {
        // 更新现有笔记
        const updateData: NoteUpdate = { title, content };
        await noteApi.updateNote(note.id, updateData);
        toast({
          title: '保存成功',
          description: '笔记已更新',
        });
      } else {
        // 创建新笔记
        const createData: NoteCreate = { title, content };
        const newNote = await noteApi.createNote(createData);
        toast({
          title: '创建成功',
          description: '笔记已创建',
        });
        navigate(`/notes/${newNote.id}/edit`);
      }
    } catch (err: any) {
      toast({
        title: '保存失败',
        description: err.response?.data?.detail || '保存笔记失败',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '笔记'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左侧：返回按钮和标题 */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notes')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {isEditing ? '编辑笔记' : '新建笔记'}
                </h1>
                {note && (
                  <p className="text-sm text-gray-500">
                    最后更新：{new Date(note.updated_at).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!content.trim()}
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>

              {note && !isSubmitted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubmitForReview}
                >
                  <Send className="w-4 h-4 mr-2" />
                  提交审核
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || isSubmitted}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 标题输入 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                笔记标题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="输入笔记标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitted}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* 内容编辑区 */}
          <Card className="flex-1">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
                <div className="border-b px-6 py-3">
                  <TabsList>
                    <TabsTrigger value="edit" className="flex items-center">
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      预览
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="edit" className="m-0">
                  <Textarea
                    placeholder="在这里使用Markdown语法编写笔记内容..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitted}
                    className="min-h-[500px] border-0 rounded-none resize-none focus:ring-0 font-mono"
                  />
                </TabsContent>

                <TabsContent value="preview" className="m-0">
                  <div className="p-6 min-h-[500px] prose prose-lg max-w-none">
                    {content.trim() ? (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        没有内容可预览
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 提示信息 */}
          {isSubmitted && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center text-blue-800">
                  <Send className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    此笔记已提交审核，无法编辑。如需修改，请联系管理员。
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
