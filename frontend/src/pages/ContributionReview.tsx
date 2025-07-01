import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  ExternalLink,
  GitBranch,
  User,
  Calendar,
  Star,
  Shield,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { openSourceApi, userApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GitHubContribution {
  id: number;
  github_username: string;
  issue_number: number;
  issue_title: string;
  issue_url: string;
  contribution_type: string;
  contribution_points: number;
  status: 'pending' | 'accepted' | 'rejected';
  github_created_at: string;
  accepted_at?: string;
  blockchain_hash?: string;
  user_id?: number;
}

interface User {
  id: number;
  username: string;
  github_username?: string;
  avatar?: string;
}

const contributionTypeLabels = {
  'bug_report': 'Bug报告',
  'feature_request': '功能建议',
  'documentation': '文档改进',
  'ui_ux_improvement': 'UI/UX改进',
  'testing': '测试',
  'other': '其他'
};

const statusLabels = {
  'pending': '待审核',
  'accepted': '已接受',
  'rejected': '已拒绝'
};

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'accepted': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800'
};

export default function ContributionReview() {
  const [contributions, setContributions] = useState<GitHubContribution[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadContributions();
    loadUsers();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      // 调用真实的API获取贡献记录
      const contributionsData = await openSourceApi.getContributions();
      setContributions(contributionsData);
    } catch (error) {
      console.error('Failed to load contributions:', error);
      toast({
        title: "加载失败",
        description: "无法加载贡献记录，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // 调用真实的API获取用户列表
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAcceptContribution = async (contributionId: number, userId?: number) => {
    setProcessing(prev => new Set(prev).add(contributionId));
    
    try {
      // 调用真实的API接受贡献
      const updatedContribution = await openSourceApi.acceptContribution(contributionId, userId);
      
      setContributions(prev => prev.map(c => 
        c.id === contributionId ? updatedContribution : c
      ));
      
      toast({
        title: "贡献已接受",
        description: "贡献已成功接受并完成链上确权",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to accept contribution:', error);
      toast({
        title: "操作失败",
        description: "接受贡献时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(contributionId);
        return newSet;
      });
    }
  };

  const handleRejectContribution = async (contributionId: number) => {
    setProcessing(prev => new Set(prev).add(contributionId));
    
    try {
      // 调用真实的API拒绝贡献
      const updatedContribution = await openSourceApi.rejectContribution(contributionId);
      
      setContributions(prev => prev.map(c => 
        c.id === contributionId ? updatedContribution : c
      ));
      
      toast({
        title: "贡献已拒绝",
        description: "贡献已被拒绝",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to reject contribution:', error);
      toast({
        title: "操作失败",
        description: "拒绝贡献时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(contributionId);
        return newSet;
      });
    }
  };

  const findUserByGithubUsername = (githubUsername: string) => {
    return users.find(u => u.github_username === githubUsername);
  };

  const filteredContributions = contributions
    .filter(c => {
      if (filter === 'pending') return c.status === 'pending';
      if (filter === 'accepted') return c.status === 'accepted';
      if (filter === 'rejected') return c.status === 'rejected';
      return true;
    })
    .filter(c => 
      c.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.github_username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const pendingCount = contributions.filter(c => c.status === 'pending').length;
  const acceptedCount = contributions.filter(c => c.status === 'accepted').length;
  const totalPoints = contributions
    .filter(c => c.status === 'accepted')
    .reduce((sum, c) => sum + c.contribution_points, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GitHub贡献审核</h1>
          <p className="text-gray-600 mt-2">审核和管理来自GitHub的社区贡献</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">待审核</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
              <div className="text-sm text-gray-600">已接受</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">累计积分</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {contributions.filter(c => c.blockchain_hash).length}
              </div>
              <div className="text-sm text-gray-600">已上链</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索贡献标题或GitHub用户名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="accepted">已接受</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={loadContributions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 贡献列表 */}
        <div className="space-y-4">
          {filteredContributions.map((contribution) => {
            const user = findUserByGithubUsername(contribution.github_username);
            const isProcessing = processing.has(contribution.id);
            
            return (
              <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar || `https://github.com/${contribution.github_username}.png`} />
                          <AvatarFallback>{contribution.github_username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contribution.github_username}</span>
                            {user && (
                              <Badge variant="outline" className="text-xs">
                                平台用户: {user.username}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <GitBranch className="h-3 w-3" />
                            <span>Issue #{contribution.issue_number}</span>
                            <Calendar className="h-3 w-3 ml-2" />
                            <span>{new Date(contribution.github_created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2">{contribution.issue_title}</h3>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant="secondary">
                          {contributionTypeLabels[contribution.contribution_type as keyof typeof contributionTypeLabels]}
                        </Badge>
                        
                        <span className="text-sm text-green-600 font-medium">
                          +{contribution.contribution_points}分
                        </span>
                        
                        <Badge className={statusColors[contribution.status]}>
                          {statusLabels[contribution.status]}
                        </Badge>
                        
                        {contribution.blockchain_hash && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Shield className="h-3 w-3" />
                            <span>已上链: {contribution.blockchain_hash.slice(0, 10)}...</span>
                          </div>
                        )}
                      </div>
                      
                      {contribution.accepted_at && (
                        <div className="text-xs text-gray-500">
                          接受时间: {new Date(contribution.accepted_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(contribution.issue_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        查看Issue
                      </Button>
                      
                      {contribution.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptContribution(contribution.id, user?.id)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            接受
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectContribution(contribution.id)}
                            disabled={isProcessing}
                          >
                            <XCircle className="h-4 w-4" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredContributions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无贡献记录</h3>
              <p className="text-gray-600">当前筛选条件下没有找到任何贡献记录</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
