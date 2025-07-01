import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '@/hooks/useProjectDetail';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import { OpenProject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, error, setProject } = useProjectDetail(Number(projectId));
  const { updateProject } = useUpdateProject();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<OpenProject>>({});

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error}</div>;
  if (!project) return <div>未找到项目</div>;

  const handleEdit = () => {
    setForm({ ...project });
    setEditMode(true);
  };

  const handleSave = async () => {
    const updated = await updateProject(project.id, form);
    if (updated) {
      setProject(updated);
      setEditMode(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {editMode ? (
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            ) : (
              project.name
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">项目描述</label>
            {editMode ? (
              <Input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            ) : (
              <div>{project.description}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">GitHub仓库地址</label>
            {editMode ? (
              <Input value={form.github_repo || ''} onChange={e => setForm(f => ({ ...f, github_repo: e.target.value }))} />
            ) : (
              <div>{project.github_repo}</div>
            )}
          </div>
          {editMode ? (
            <div className="flex gap-2">
              <Button onClick={handleSave}>保存</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>取消</Button>
            </div>
          ) : (
            <Button onClick={handleEdit}>编辑</Button>
          )}
        </CardContent>
      </Card>
      <Tabs defaultValue="contributions" className="mt-8">
        <TabsList>
          <TabsTrigger value="contributions">贡献</TabsTrigger>
          <TabsTrigger value="members">成员管理</TabsTrigger>
          <TabsTrigger value="invites">邀请审核</TabsTrigger>
          <TabsTrigger value="tags">标签管理</TabsTrigger>
        </TabsList>
        <TabsContent value="contributions">
          {/* TODO: 贡献列表组件 */}
          <div>贡献列表（自动同步GitHub issue，管理员可审核并积分上链）</div>
        </TabsContent>
        <TabsContent value="members">
          {/* TODO: 成员管理组件 */}
          <div>成员管理</div>
        </TabsContent>
        <TabsContent value="invites">
          {/* TODO: 邀请审核组件 */}
          <div>邀请审核</div>
        </TabsContent>
        <TabsContent value="tags">
          {/* TODO: 标签管理组件 */}
          <div>标签管理</div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 