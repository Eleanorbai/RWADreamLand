import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Clock,
  Pin,
  ThumbsUp,
  MessageCircle,
  Eye,
  Filter,
  Users,
  Award,
  Star,
  Flag,
  MoreVertical,
  Send,
  Image,
  Paperclip,
  Smile,
  Hash,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Volume2,
  Video,
  Phone,
  Settings,
  UserCheck,
  Shield,
  Zap,
  Activity,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { discussionApi, commentApi } from '@/lib/api';
import { Discussion, Comment, DiscussionType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 讨论分类
const DiscussionCategories = {
  GENERAL: 'general',
  TECHNICAL: 'technical',
  MARKET: 'market',
  LEGAL: 'legal',
  PROJECT: 'project',
  NEWS: 'news',
  QA: 'qa',
  OTHER: 'other'
} as const;

// 模拟热门话题数据
const mockTopics = [
  {
    id: 1,
    title: 'RWA代币化的监管风险分析',
    content: '最近各国对RWA代币化的监管政策变化频繁，想和大家讨论一下如何应对潜在的监管风险...',
    author: {
      id: 1,
      username: 'crypto_analyst',
      full_name: '区块链分析师',
      avatar_url: '',
      role: 'expert'
    },
    category: DiscussionCategories.LEGAL,
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T15:45:00Z',
    is_pinned: true,
    reply_count: 23,
    like_count: 45,
    view_count: 312,
    tags: ['监管', 'RWA', '风险管理']
  },
  {
    id: 2,
    title: '房地产代币化项目技术架构探讨',
    content: '正在设计一个房地产代币化项目，想请教大家关于技术架构的最佳实践...',
    author: {
      id: 2,
      username: 'dev_master',
      full_name: '开发大师',
      avatar_url: '',
      role: 'user'
    },
    category: DiscussionCategories.TECHNICAL,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-01-20T14:20:00Z',
    is_pinned: false,
    reply_count: 17,
    like_count: 32,
    view_count: 189,
    tags: ['技术', '房地产', '架构']
  },
  {
    id: 3,
    title: '2024年RWA市场趋势预测',
    content: '基于当前市场数据和政策环境，我认为2024年RWA市场会有以下几个趋势...',
    author: {
      id: 3,
      username: 'market_guru',
      full_name: '市场专家',
      avatar_url: '',
      role: 'expert'
    },
    category: DiscussionCategories.MARKET,
    created_at: '2024-01-19T16:45:00Z',
    updated_at: '2024-01-20T11:30:00Z',
    is_pinned: false,
    reply_count: 31,
    like_count: 67,
    view_count: 445,
    tags: ['市场分析', '趋势', '2024']
  },
  {
    id: 4,
    title: '新手问：如何参与RWA投资？',
    content: '作为区块链新手，想了解如何安全地参与RWA投资，有什么需要注意的吗？',
    author: {
      id: 4,
      username: 'newbie_123',
      full_name: '新手小白',
      avatar_url: '',
      role: 'user'
    },
    category: DiscussionCategories.QA,
    created_at: '2024-01-19T14:20:00Z',
    updated_at: '2024-01-19T18:50:00Z',
    is_pinned: false,
    reply_count: 12,
    like_count: 18,
    view_count: 156,
    tags: ['新手', '投资', '指南']
  }
];

// 模拟在线用户
const mockOnlineUsers = [
  { id: 1, username: 'crypto_analyst', status: 'online' },
  { id: 2, username: 'dev_master', status: 'away' },
  { id: 3, username: 'market_guru', status: 'online' },
  { id: 4, username: 'newbie_123', status: 'online' },
  { id: 5, username: 'rwa_expert', status: 'busy' }
];

export default function Dock() {
  const [discussions, setDiscussions] = useState<any[]>(mockTopics);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: DiscussionCategories.GENERAL
  });
  const navigate = useNavigate();

  const getCategoryLabel = (category: string) => {
    const labels = {
      [DiscussionCategories.GENERAL]: '综合讨论',
      [DiscussionCategories.TECHNICAL]: '技术交流',
      [DiscussionCategories.MARKET]: '市场分析',
      [DiscussionCategories.LEGAL]: '法律法规',
      [DiscussionCategories.PROJECT]: '项目分享',
      [DiscussionCategories.NEWS]: '行业动态',
      [DiscussionCategories.QA]: '问答求助',
      [DiscussionCategories.OTHER]: '其他'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      [DiscussionCategories.GENERAL]: 'bg-gray-100 text-gray-800',
      [DiscussionCategories.TECHNICAL]: 'bg-blue-100 text-blue-800',
      [DiscussionCategories.MARKET]: 'bg-green-100 text-green-800',
      [DiscussionCategories.LEGAL]: 'bg-red-100 text-red-800',
      [DiscussionCategories.PROJECT]: 'bg-purple-100 text-purple-800',
      [DiscussionCategories.NEWS]: 'bg-orange-100 text-orange-800',
      [DiscussionCategories.QA]: 'bg-yellow-100 text-yellow-800',
      [DiscussionCategories.OTHER]: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case 'expert':
        return <Badge className="bg-gold-100 text-gold-800 text-xs">专家</Badge>;
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 text-xs">管理员</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">版主</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      // 这里应该调用API创建新话题
      // const discussion = await discussionApi.createDiscussion({
      //   title: newTopic.title,
      //   content: newTopic.content,
      //   discussion_type: DiscussionType.SQUARE
      // });
      
      toast.success('话题创建成功');
      setShowNewTopicDialog(false);
      setNewTopic({ title: '', content: '', category: DiscussionCategories.GENERAL });
      // 重新加载讨论列表
    } catch (error) {
      toast.error('创建话题失败');
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = !searchQuery || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.like_count + b.view_count) - (a.like_count + a.view_count);
      case 'trending':
        const aScore = a.like_count + a.view_count + a.reply_count + (new Date(a.updated_at).getTime() / 1000000);
        const bScore = b.like_count + b.view_count + b.reply_count + (new Date(b.updated_at).getTime() / 1000000);
        return bScore - aScore;
      case 'latest':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">Dock讨论区</h1>
          <p className="text-gray-600">开放式社区讨论，共建RWA知识生态</p>
        </div>
        <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              发起话题
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>发起新话题</DialogTitle>
              <DialogDescription>
                分享你的想法，与社区成员开展讨论
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">话题分类</label>
                <Select 
                  value={newTopic.category} 
                  onValueChange={(value) => setNewTopic({...newTopic, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DiscussionCategories.GENERAL}>综合讨论</SelectItem>
                    <SelectItem value={DiscussionCategories.TECHNICAL}>技术交流</SelectItem>
                    <SelectItem value={DiscussionCategories.MARKET}>市场分析</SelectItem>
                    <SelectItem value={DiscussionCategories.LEGAL}>法律法规</SelectItem>
                    <SelectItem value={DiscussionCategories.PROJECT}>项目分享</SelectItem>
                    <SelectItem value={DiscussionCategories.NEWS}>行业动态</SelectItem>
                    <SelectItem value={DiscussionCategories.QA}>问答求助</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">话题标题</label>
                <Input
                  placeholder="输入话题标题..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">内容描述</label>
                <Textarea
                  placeholder="详细描述你想讨论的内容..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTopicDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateTopic}>
                发布话题
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主讨论区域 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索话题内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  <SelectItem value={DiscussionCategories.GENERAL}>综合讨论</SelectItem>
                  <SelectItem value={DiscussionCategories.TECHNICAL}>技术交流</SelectItem>
                  <SelectItem value={DiscussionCategories.MARKET}>市场分析</SelectItem>
                  <SelectItem value={DiscussionCategories.LEGAL}>法律法规</SelectItem>
                  <SelectItem value={DiscussionCategories.PROJECT}>项目分享</SelectItem>
                  <SelectItem value={DiscussionCategories.NEWS}>行业动态</SelectItem>
                  <SelectItem value={DiscussionCategories.QA}>问答求助</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">最新回复</SelectItem>
                  <SelectItem value="popular">最受欢迎</SelectItem>
                  <SelectItem value="trending">热门趋势</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">活跃话题</p>
                    <p className="text-2xl font-bold text-gray-900">{discussions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">在线用户</p>
                    <p className="text-2xl font-bold text-gray-900">{mockOnlineUsers.filter(u => u.status === 'online').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总回复数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {discussions.reduce((sum, d) => sum + d.reply_count, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Pin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">置顶话题</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {discussions.filter(d => d.is_pinned).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 话题列表 */}
          {sortedDiscussions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无话题</h3>
              <p className="text-gray-500 mb-4">还没有符合条件的话题，快来发起第一个话题吧！</p>
              <Button onClick={() => setShowNewTopicDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                发起话题
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDiscussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={discussion.author.avatar_url} />
                        <AvatarFallback>
                          {discussion.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {discussion.is_pinned && (
                            <Pin className="w-4 h-4 text-red-500" />
                          )}
                          <Badge className={getCategoryColor(discussion.category)}>
                            {getCategoryLabel(discussion.category)}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {discussion.author.full_name || discussion.author.username}
                          </span>
                          {getUserRoleBadge(discussion.author.role)}
                          <span className="text-gray-500 text-sm">
                            {formatTime(discussion.updated_at)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-teal-600 transition-colors cursor-pointer">
                          {discussion.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {discussion.content}
                        </p>
                        
                        {/* 标签 */}
                        {discussion.tags && discussion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {discussion.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <Separator className="my-4" />
                        
                        {/* 互动区域 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {discussion.like_count}
                            </Button>
                            
                            <div className="flex items-center text-gray-500 text-sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {discussion.reply_count}
                            </div>
                            
                            <div className="flex items-center text-gray-500 text-sm">
                              <Eye className="w-4 h-4 mr-1" />
                              {discussion.view_count}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              分享
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>查看详情</DropdownMenuItem>
                                <DropdownMenuItem>举报</DropdownMenuItem>
                                <DropdownMenuItem>屏蔽用户</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 在线用户 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                在线用户 ({mockOnlineUsers.filter(u => u.status === 'online').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOnlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                    </div>
                    <span className="text-sm text-gray-700">{user.username}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热门标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Hash className="w-5 h-5 mr-2" />
                热门标签
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['RWA', '区块链', '投资', '技术', '监管', '房地产', '代币化', '风险管理'].map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 社区规则 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2" />
                社区规则
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>保持友善，尊重他人观点</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>发布有价值的内容</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>禁止垃圾信息和广告</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                  <span>遵守法律法规</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 活动公告 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                活动公告
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-sm text-blue-900 mb-1">RWA技术研讨会</div>
                  <div className="text-xs text-blue-600">2024年2月15日 14:00</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-sm text-green-900 mb-1">月度优质内容评选</div>
                  <div className="text-xs text-green-600">正在进行中</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 