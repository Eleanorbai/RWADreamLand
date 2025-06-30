import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  MessageCirclePlus,
  Search,
  Filter,
  Download,
  Calculator,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp,
  Award,
  Target,
  Zap,
  Database,
  FileText,
  HelpCircle,
  Brain,
  Lightbulb
} from 'lucide-react';
import { discussionApi, contentApi } from '@/lib/api';
import { Discussion, Content, DiscussionType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 模拟数据 - 实际项目中应该从API获取
const mockMarketData = {
  totalValue: 24.44,
  totalValueChange: 5.71,
  totalHolders: 222326,
  totalHoldersChange: 95.77,
  totalIssuers: 196,
  stablecoinValue: 240.0,
  stablecoinChange: 2.22,
  stablecoinHolders: 169.38,
  stablecoinHoldersChange: 2.61
};

const mockAssetClasses = [
  { name: 'Stablecoins', value: 240.0, change: 2.22, color: 'bg-blue-500' },
  { name: 'U.S. Treasuries', value: 1.2, change: -1.5, color: 'bg-green-500' },
  { name: 'Private Credit', value: 8.9, change: 12.3, color: 'bg-purple-500' },
  { name: 'Commodities', value: 0.8, change: 5.7, color: 'bg-orange-500' },
  { name: 'Global Bonds', value: 0.3, change: -3.2, color: 'bg-red-500' },
  { name: 'Stocks', value: 0.1, change: 15.8, color: 'bg-yellow-500' }
];

const mockTools = [
  {
    id: 1,
    name: 'RWA项目评估器',
    description: '全面评估RWA项目的风险和收益潜力',
    category: 'evaluation',
    icon: Calculator,
    usage: 1234
  },
  {
    id: 2,
    name: '风险计算器',
    description: '计算投资风险和预期收益',
    category: 'risk',
    icon: Target,
    usage: 856
  },
  {
    id: 3,
    name: '合规检查清单',
    description: '确保项目符合相关法规要求',
    category: 'compliance',
    icon: CheckCircle,
    usage: 672
  },
  {
    id: 4,
    name: '市场分析模板',
    description: '标准化的市场分析框架',
    category: 'analysis',
    icon: BarChart,
    usage: 543
  }
];

const mockResources = [
  {
    id: 1,
    title: 'RWA行业发展报告 2024',
    type: 'report',
    size: '2.5MB',
    downloads: 1234,
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'TokenBridge技术白皮书',
    type: 'whitepaper',
    size: '1.8MB',
    downloads: 892,
    date: '2024-01-10'
  },
  {
    id: 3,
    title: '监管政策解读指南',
    type: 'guide',
    size: '3.2MB',
    downloads: 756,
    date: '2024-01-08'
  }
];

export default function Intelligence() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      // 获取情报港相关的讨论
      const data = await discussionApi.getDiscussions();
      setDiscussions(data);
    } catch (error) {
      console.error('加载讨论失败:', error);
      toast.error('加载讨论失败');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, unit: string = '') => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${unit}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${unit}`;
    }
    return `${num}${unit}`;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'report':
        return FileText;
      case 'whitepaper':
        return BookOpen;
      case 'guide':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">情报港</h1>
          <p className="text-gray-600">RWA市场数据、分析工具与专业资源</p>
        </div>
        <Button 
          onClick={() => navigate('/discussions/new')} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <MessageCirclePlus className="w-4 h-4 mr-2" />
          发起问题
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            数据看板
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            分析工具
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <Database className="w-4 h-4 mr-2" />
            资源库
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            问答社区
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            市场洞察
          </TabsTrigger>
        </TabsList>

        {/* 数据看板 */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* 核心指标 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总RWA价值</p>
                    <p className="text-2xl font-bold text-gray-900">${mockMarketData.totalValue}B</p>
                    <div className="mt-1">{formatChange(mockMarketData.totalValueChange)}</div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总持有者</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(mockMarketData.totalHolders)}</p>
                    <div className="mt-1">{formatChange(mockMarketData.totalHoldersChange)}</div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">发行机构</p>
                    <p className="text-2xl font-bold text-gray-900">{mockMarketData.totalIssuers}</p>
                    <div className="mt-1 text-gray-500">活跃发行方</div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">稳定币价值</p>
                    <p className="text-2xl font-bold text-gray-900">${mockMarketData.stablecoinValue}B</p>
                    <div className="mt-1">{formatChange(mockMarketData.stablecoinChange)}</div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 资产类别分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                资产类别分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssetClasses.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${asset.color}`}></div>
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${asset.value}B</div>
                      <div className="text-sm">{formatChange(asset.change)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析工具 */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <ToolIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(tool.usage)} 次使用
                          </Badge>
                          <Button size="sm" variant="outline">
                            使用工具
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 工具使用指南 */}
          <Card>
            <CardHeader>
              <CardTitle>工具使用指南</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">快速入门</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      选择适合的分析工具
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      输入项目基础信息
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      获取专业分析报告
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      导出分析结果
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">注意事项</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      确保数据准确性
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      定期更新分析模型
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      结合专家意见
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      谨慎投资决策
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 资源库 */}
        <TabsContent value="resources" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索资源..."
                  className="pl-10 w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="report">研究报告</SelectItem>
                  <SelectItem value="whitepaper">白皮书</SelectItem>
                  <SelectItem value="guide">指南文档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              批量下载
            </Button>
          </div>

          <div className="grid gap-4">
            {mockResources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <ResourceIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{resource.size}</span>
                            <span>{formatNumber(resource.downloads)} 下载</span>
                            <span>{resource.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          预览
                        </Button>
                        <Button size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 问答社区 */}
        <TabsContent value="qa" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => navigate('/discussions/new')}>
              <MessageCirclePlus className="w-4 h-4 mr-2" />
              提问
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredDiscussions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无问题</h3>
              <p className="text-gray-500 mb-4">还没有人提出问题，快来提出第一个问题吧！</p>
              <Button onClick={() => navigate('/discussions/new')}>
                <MessageCirclePlus className="w-4 h-4 mr-2" />
                提问
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={discussion.author?.avatar_url} />
                        <AvatarFallback>
                          {discussion.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {discussion.author?.full_name || discussion.author?.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(discussion.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                          {discussion.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {discussion.content}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            浏览
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {discussion.reply_count || 0} 回复
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            点赞
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 市场洞察 */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                市场趋势分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">关键趋势</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">稳定币市场增长</span>
                      <Badge className="bg-green-100 text-green-800">+5.7%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">私募信贷代币化</span>
                      <Badge className="bg-blue-100 text-blue-800">+12.3%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">监管框架完善</span>
                      <Badge className="bg-purple-100 text-purple-800">积极</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">风险提示</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm">流动性风险需关注</span>
                    </div>
                    <div className="flex items-center p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm">监管政策变化</span>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                      <span className="text-sm">技术安全考量</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 