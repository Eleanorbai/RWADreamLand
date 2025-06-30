import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { 
  Users, 
  Plus, 
  Settings, 
  Lock, 
  Globe, 
  Crown,
  Shield,
  Calendar
} from 'lucide-react';
import { groupApi } from '../lib/api';
import { Group, GroupCreate, GroupRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const navigate = useNavigate();

  const [newGroup, setNewGroup] = useState<GroupCreate>({
    name: '',
    description: '',
    is_public: true,
    max_members: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载数据
      const [allGroupsData, myGroupsData] = await Promise.all([
        groupApi.getGroups(0, 50),
        groupApi.getMyGroups()
      ]);
      
      setGroups(allGroupsData);
      setMyGroups(myGroupsData);
    } catch (error) {
      console.error('加载小组数据失败:', error);
      toast.error('加载小组数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      if (!newGroup.name.trim()) {
        toast.error('请输入小组名称');
        return;
      }

      await groupApi.createGroup(newGroup);
      toast.success('小组创建成功');
      
      // 重置表单并关闭对话框
      setNewGroup({
        name: '',
        description: '',
        is_public: true,
        max_members: undefined
      });
      setShowCreateDialog(false);
      
      // 重新加载数据
      loadData();
    } catch (error) {
      console.error('创建小组失败:', error);
      toast.error('创建小组失败');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupApi.joinGroup(groupId);
      toast.success('加入小组成功');
      loadData();
    } catch (error) {
      console.error('加入小组失败:', error);
      toast.error('加入小组失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const isGroupMember = (group: Group) => {
    return myGroups.some(myGroup => myGroup.id === group.id);
  };

  const displayGroups = activeTab === 'all' ? groups : myGroups;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">小组管理</h1>
          <p className="text-gray-600">参与小组讨论，协作学习RWA知识</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              创建小组
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>创建新小组</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  小组名称 *
                </label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入小组名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  小组描述
                </label>
                <Textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述小组的目标和内容"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大成员数
                </label>
                <Input
                  type="number"
                  value={newGroup.max_members || ''}
                  onChange={(e) => setNewGroup(prev => ({ 
                    ...prev, 
                    max_members: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="留空表示无限制"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newGroup.is_public}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  公开小组（任何人都可以查看和加入）
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateGroup}>
                  创建小组
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              所有小组 ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              我的小组 ({myGroups.length})
            </button>
          </nav>
        </div>
      </div>

      {/* 小组列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {group.is_public ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                  <Badge variant={group.is_public ? "default" : "secondary"}>
                    {group.is_public ? '公开' : '私密'}
                  </Badge>
                </div>
                
                {isGroupMember(group) && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    已加入
                  </Badge>
                )}
              </div>
              
              <CardTitle 
                className="text-lg hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {group.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {group.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {group.description}
                </p>
              )}

              {/* 小组信息 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Crown className="w-4 h-4 mr-2" />
                  <span>创建者: {group.owner?.full_name || group.owner?.username}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {group.member_count} 成员
                    {group.max_members && ` / ${group.max_members}`}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>创建于 {formatDate(group.created_at)}</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-between items-center pt-4 border-t">
                {isGroupMember(group) ? (
                  <div className="flex space-x-2 w-full">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      进入小组
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/groups/${group.id}/settings`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      查看详情
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.max_members ? group.member_count >= group.max_members : false}
                    >
                      {group.max_members && group.member_count >= group.max_members ? '已满' : '加入小组'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {displayGroups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-400 text-lg mb-2">
            {activeTab === 'all' ? '暂无小组' : '您还没有加入任何小组'}
          </div>
          <p className="text-gray-500 mb-4">
            {activeTab === 'all' 
              ? '创建第一个小组开始协作学习' 
              : '加入或创建小组来开始协作学习'
            }
          </p>
          {activeTab === 'my' && (
            <Button onClick={() => setActiveTab('all')}>
              浏览所有小组
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Groups;
