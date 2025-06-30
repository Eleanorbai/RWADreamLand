import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  UserPlus,
  Settings,
  MoreVertical,
  Briefcase,
  Award,
  Building,
  Lightbulb,
  Rocket,
  Shield,
  CheckCircle,
  AlertCircle,
  Timer,
  Users2,
  FileText,
  GitBranch,
  Activity,
  BarChart3
} from 'lucide-react';
import { groupApi } from '@/lib/api';
import { Group, GroupMember } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 项目阶段枚举
const ProjectStage = {
  IDEA: 'idea',
  PLANNING: 'planning',
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  LAUNCH: 'launch',
  SCALING: 'scaling'
} as const;

// 项目类型枚举
const ProjectType = {
  REAL_ESTATE: 'real_estate',
  COMMODITIES: 'commodities',
  BONDS: 'bonds',
  INFRASTRUCTURE: 'infrastructure',
  ART: 'art',
  CARBON_CREDITS: 'carbon_credits',
  OTHER: 'other'
} as const;

// 模拟项目数据
const mockProjects = [
  {
    id: 1,
    name: '上海商业地产代币化项目',
    description: '将优质商业地产通过区块链技术进行代币化，为投资者提供更低门槛的房地产投资机会。',
    type: ProjectType.REAL_ESTATE,
    stage: ProjectStage.DEVELOPMENT,
    progress: 65,
    totalValue: 50000000,
    raised: 32500000,
    investors: 245,
    teamSize: 8,
    daysLeft: 45,
    leaderId: 1,
    leader: {
      name: '张明',
      avatar: '',
      title: '项目经理'
    },
    tags: ['房地产', 'DeFi', '投资'],
    location: '上海',
    foundedDate: '2024-01-15',
    lastUpdate: '2024-01-20',
    isRecruiting: true,
    openPositions: [
      { role: '区块链开发工程师', count: 2 },
      { role: '金融分析师', count: 1 }
    ]
  },
  {
    id: 2,
    name: '黄金储备代币',
    description: '基于实物黄金储备的数字代币项目，提供稳定的价值储存和流动性。',
    type: ProjectType.COMMODITIES,
    stage: ProjectStage.TESTING,
    progress: 85,
    totalValue: 10000000,
    raised: 8500000,
    investors: 156,
    teamSize: 5,
    daysLeft: 20,
    leaderId: 2,
    leader: {
      name: '李晓',
      avatar: '',
      title: '技术负责人'
    },
    tags: ['黄金', '稳定币', '储备'],
    location: '深圳',
    foundedDate: '2023-11-10',
    lastUpdate: '2024-01-18',
    isRecruiting: false,
    openPositions: []
  },
  {
    id: 3,
    name: '碳信用交易平台',
    description: '构建透明、高效的碳信用交易平台，推动绿色金融发展。',
    type: ProjectType.CARBON_CREDITS,
    stage: ProjectStage.PLANNING,
    progress: 25,
    totalValue: 5000000,
    raised: 1250000,
    investors: 78,
    teamSize: 6,
    daysLeft: 90,
    leaderId: 3,
    leader: {
      name: '王静',
      avatar: '',
      title: '环保专家'
    },
    tags: ['碳交易', 'ESG', '环保'],
    location: '北京',
    foundedDate: '2024-01-01',
    lastUpdate: '2024-01-19',
    isRecruiting: true,
    openPositions: [
      { role: '环境科学家', count: 1 },
      { role: '产品经理', count: 1 }
    ]
  }
];

export default function Origin() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState(mockProjects);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const groupData = await groupApi.getGroups(0, 50);
      setGroups(groupData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      [ProjectStage.IDEA]: '创意阶段',
      [ProjectStage.PLANNING]: '规划阶段',
      [ProjectStage.DEVELOPMENT]: '开发阶段',
      [ProjectStage.TESTING]: '测试阶段',
      [ProjectStage.LAUNCH]: '启动阶段',
      [ProjectStage.SCALING]: '扩展阶段'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors = {
      [ProjectStage.IDEA]: 'bg-yellow-100 text-yellow-800',
      [ProjectStage.PLANNING]: 'bg-blue-100 text-blue-800',
      [ProjectStage.DEVELOPMENT]: 'bg-purple-100 text-purple-800',
      [ProjectStage.TESTING]: 'bg-orange-100 text-orange-800',
      [ProjectStage.LAUNCH]: 'bg-green-100 text-green-800',
      [ProjectStage.SCALING]: 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      [ProjectType.REAL_ESTATE]: '房地产',
      [ProjectType.COMMODITIES]: '大宗商品',
      [ProjectType.BONDS]: '债券',
      [ProjectType.INFRASTRUCTURE]: '基础设施',
      [ProjectType.ART]: '艺术品',
      [ProjectType.CARBON_CREDITS]: '碳信用',
      [ProjectType.OTHER]: '其他'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `¥${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `¥${(amount / 1000).toFixed(1)}K`;
    }
    return `¥${amount}`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || project.type === selectedType;
    const matchesStage = selectedStage === 'all' || project.stage === selectedStage;
    
    return matchesSearch && matchesType && matchesStage;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-orange-800 mb-2">原点馆</h1>
          <p className="text-gray-600">RWA项目孵化与团队协作中心</p>
        </div>
        <Button 
          onClick={() => navigate('/groups/new')} 
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          发起项目
        </Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects" className="flex items-center">
            <Rocket className="w-4 h-4 mr-2" />
            项目展示
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center">
            <Users2 className="w-4 h-4 mr-2" />
            团队协作
          </TabsTrigger>
          <TabsTrigger value="incubation" className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            孵化支持
          </TabsTrigger>
          <TabsTrigger value="showcase" className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            成功案例
          </TabsTrigger>
        </TabsList>

        {/* 项目展示 */}
        <TabsContent value="projects" className="space-y-6">
          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索项目名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="项目类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value={ProjectType.REAL_ESTATE}>房地产</SelectItem>
                  <SelectItem value={ProjectType.COMMODITIES}>大宗商品</SelectItem>
                  <SelectItem value={ProjectType.BONDS}>债券</SelectItem>
                  <SelectItem value={ProjectType.INFRASTRUCTURE}>基础设施</SelectItem>
                  <SelectItem value={ProjectType.ART}>艺术品</SelectItem>
                  <SelectItem value={ProjectType.CARBON_CREDITS}>碳信用</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="项目阶段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部阶段</SelectItem>
                  <SelectItem value={ProjectStage.IDEA}>创意阶段</SelectItem>
                  <SelectItem value={ProjectStage.PLANNING}>规划阶段</SelectItem>
                  <SelectItem value={ProjectStage.DEVELOPMENT}>开发阶段</SelectItem>
                  <SelectItem value={ProjectStage.TESTING}>测试阶段</SelectItem>
                  <SelectItem value={ProjectStage.LAUNCH}>启动阶段</SelectItem>
                  <SelectItem value={ProjectStage.SCALING}>扩展阶段</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  网格
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  列表
                </Button>
              </div>
            </div>
          </div>

          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Rocket className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">活跃项目</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总融资额</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.raised, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">参与人数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.reduce((sum, p) => sum + p.investors, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserPlus className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">招募中</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.isRecruiting).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 项目列表 */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
              <p className="text-gray-500 mb-4">还没有符合条件的项目，快来发起第一个项目吧！</p>
              <Button onClick={() => navigate('/groups/new')}>
                <Plus className="w-4 h-4 mr-2" />
                发起项目
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStageColor(project.stage)}>
                            {getStageLabel(project.stage)}
                          </Badge>
                          {project.isRecruiting && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              招募中
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mb-2 hover:text-orange-600 transition-colors">
                          {project.name}
                        </CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>查看详情</DropdownMenuItem>
                          <DropdownMenuItem>申请加入</DropdownMenuItem>
                          <DropdownMenuItem>分享项目</DropdownMenuItem>
                          <DropdownMenuItem>收藏</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* 项目负责人 */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={project.leader.avatar} />
                        <AvatarFallback>
                          {project.leader.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{project.leader.name}</div>
                        <div className="text-gray-500 text-xs">{project.leader.title}</div>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>项目进度</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* 融资信息 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">已融资</div>
                        <div className="text-sm font-semibold">{formatCurrency(project.raised)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">目标金额</div>
                        <div className="text-sm font-semibold">{formatCurrency(project.totalValue)}</div>
                      </div>
                    </div>

                    {/* 项目信息 */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">投资人</div>
                        <div className="text-sm font-semibold">{project.investors}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">团队规模</div>
                        <div className="text-sm font-semibold">{project.teamSize}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">剩余天数</div>
                        <div className="text-sm font-semibold">{project.daysLeft}</div>
                      </div>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* 招募信息 */}
                    {project.isRecruiting && project.openPositions.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2 flex items-center">
                          <UserPlus className="w-4 h-4 mr-1" />
                          正在招募
                        </div>
                        <div className="space-y-1">
                          {project.openPositions.map((position, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                              {position.role} × {position.count}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          讨论
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {project.isRecruiting && (
                          <Button size="sm" variant="outline">
                            申请加入
                          </Button>
                        )}
                        <Button size="sm">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 团队协作 */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                    </div>
                    <Badge variant={group.is_public ? 'default' : 'secondary'}>
                      {group.is_public ? '公开' : '私密'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {group.member_count} 成员
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(group.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      加入团队
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 孵化支持 */}
        <TabsContent value="incubation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  导师资源
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>导</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">行业专家导师</div>
                      <div className="text-sm text-gray-500">20+ 位资深导师</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>技</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">技术指导</div>
                      <div className="text-sm text-gray-500">区块链技术支持</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar>
                      <AvatarFallback>法</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">法律咨询</div>
                      <div className="text-sm text-gray-500">合规和法务指导</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  资源对接
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">投资人网络</div>
                      <div className="text-sm text-gray-500">对接潜在投资方</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">合作伙伴</div>
                      <div className="text-sm text-gray-500">产业合作机会</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">服务商</div>
                      <div className="text-sm text-gray-500">专业服务支持</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 成功案例 */}
        <TabsContent value="showcase" className="space-y-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">成功案例展示</h3>
            <p className="text-gray-500 mb-4">优秀项目案例即将展示，敬请期待！</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 