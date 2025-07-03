import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectDetail } from '@/hooks/useProjectDetail';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import { OpenProject } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// RWA阶段常量
const RWAProjectStages = [
  { value: 'idea', label: '立项/创意' },
  { value: 'due_diligence', label: '尽调' },
  { value: 'structuring', label: '结构设计' },
  { value: 'legal_compliance', label: '合规/法律' },
  { value: 'tokenization', label: '资产上链/代币化' },
  { value: 'fundraising', label: '融资/发行' },
  { value: 'operation', label: '运营管理' },
  { value: 'exit', label: '退出/清算' }
];

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
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">项目进度(%)</label>
            {editMode ? (
              <Input type="number" value={form.progress ?? ''} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} />
            ) : (
              <div>{project.progress ?? 0}%</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">目标金额</label>
            {editMode ? (
              <Input type="number" value={form.totalValue ?? ''} onChange={e => setForm(f => ({ ...f, totalValue: Number(e.target.value) }))} />
            ) : (
              <div>{project.totalValue ?? 0}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">已融资金额</label>
            {editMode ? (
              <Input type="number" value={form.raised ?? ''} onChange={e => setForm(f => ({ ...f, raised: Number(e.target.value) }))} />
            ) : (
              <div>{project.raised ?? 0}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">投资人数量</label>
            {editMode ? (
              <Input type="number" value={form.investors ?? ''} onChange={e => setForm(f => ({ ...f, investors: Number(e.target.value) }))} />
            ) : (
              <div>{project.investors ?? 0}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">团队规模</label>
            {editMode ? (
              <Input type="number" value={form.teamSize ?? ''} onChange={e => setForm(f => ({ ...f, teamSize: Number(e.target.value) }))} />
            ) : (
              <div>{project.teamSize ?? 0}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">剩余天数</label>
            {editMode ? (
              <Input type="number" value={form.daysLeft ?? ''} onChange={e => setForm(f => ({ ...f, daysLeft: Number(e.target.value) }))} />
            ) : (
              <div>{project.daysLeft ?? 0}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">资产方</label>
            {editMode ? (
              <Input value={form.asset_owner ?? ''} onChange={e => setForm(f => ({ ...f, asset_owner: e.target.value }))} />
            ) : (
              <div>{project.asset_owner || '-'}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">负责人角色</label>
            {editMode ? (
              <Input value={form.leader_role ?? ''} onChange={e => setForm(f => ({ ...f, leader_role: e.target.value }))} />
            ) : (
              <div>{project.leader_role || '-'}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">项目阶段</label>
            {editMode ? (
              <select
                className="border rounded px-2 py-1 w-full"
                value={form.stage || ''}
                onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
              >
                <option value="">请选择阶段</option>
                {RWAProjectStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            ) : (
              <div>
                {RWAProjectStages.find(s => s.value === project.stage)?.label || project.stage || '-'}
              </div>
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