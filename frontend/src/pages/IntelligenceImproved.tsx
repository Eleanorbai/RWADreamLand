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
  BarChart3,
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
  Lightbulb,
  Activity,
  Globe,
  Building2,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Star,
  Bookmark
} from 'lucide-react';
import { discussionApi, contentApi } from '@/lib/api';
import { Discussion, Content, DiscussionType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 真实风格的市场数据 - 仿照 rwa.xyz
const realTimeMarketData = {
  totalRwaValue: 24.44,
  totalRwaValueChange: 5.71,
  newIssuanceVolume: 2.1,
  newIssuanceChange: 12.5,
  totalAssetHolders: 222326,
  totalHoldersChange: 95.77,
  totalIssuers: 196,
  activeProtocols: 85,
  stablecoinValue: 240.0,
  stablecoinChange: 2.22,
  lastUpdated: new Date().toISOString()
};

// RWA 资产类别数据 - 仿照 rwa.xyz 的真实数据结构
const assetClasses = [
  { 
    name: 'Stablecoins', 
    value: 240.0, 
    change: 2.22, 
    percentage: 85.2,
    color: 'bg-blue-500',
    description: 'USD-pegged digital assets'
  },
  { 
    name: 'U.S. Treasuries', 
    value: 1.2, 
    change: -1.5,
    percentage: 4.3,
    color: 'bg-green-500',
    description: 'Government securities'
  },
  { 
    name: 'Private Credit', 
    value: 8.9, 
    change: 12.3,
    percentage: 3.2,
    color: 'bg-purple-500',
    description: 'Corporate lending'
  },
  { 
    name: 'Commodities', 
    value: 0.8, 
    change: 5.7,
    percentage: 2.8,
    color: 'bg-orange-500',
    description: 'Physical assets'
  },
  { 
    name: 'Global Bonds', 
    value: 0.3, 
    change: -3.2,
    percentage: 1.1,
    color: 'bg-red-500',
    description: 'International debt'
  },
  { 
    name: 'Real Estate', 
    value: 2.1, 
    change: 8.4,
    percentage: 7.5,
    color: 'bg-indigo-500',
    description: 'Property tokens'
  }
];

// 热门转账数据
const topTransfers = [
  {
    asset: 'USDC',
    amount: 50000000,
    usdValue: 50000000,
    date: '2h ago',
    network: 'Ethereum',
    from: '0x742d...35Cc',
    to: '0x8ba1...f46e4',
    type: 'mint'
  },
  {
    asset: 'USDT',
    amount: 25000000,
    usdValue: 25000000,
    date: '4h ago',
    network: 'Polygon',
    from: '0x5d3a...7c8b',
    to: '0x3f21...9d4a',
    type: 'transfer'
  },
  {
    asset: 'FDUSD',
    amount: 15000000,
    usdValue: 15000000,
    date: '6h ago',
    network: 'BSC',
    from: '0x9e2c...4f5d',
    to: '0x1a7b...3e8c',
    type: 'burn'
  }
];

// RWA 联盟表数据
const rwaLeagueTable = [
  {
    rank: 1,
    issuer: 'Circle',
    asset: 'USDC',
    totalValue: 28500000000,
    marketCap: 28500000000,
    assetClass: 'Stablecoin',
    change24h: 1.2,
    holders: 2890000
  },
  {
    rank: 2,
    issuer: 'Tether',
    asset: 'USDT',
    totalValue: 96200000000,
    marketCap: 96200000000,
    assetClass: 'Stablecoin',
    change24h: 0.8,
    holders: 5120000
  },
  {
    rank: 3,
    issuer: 'MakerDAO',
    asset: 'DAI',
    totalValue: 4900000000,
    marketCap: 4900000000,
    assetClass: 'Stablecoin',
    change24h: -0.3,
    holders: 156000
  }
];

export default function IntelligenceImproved() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAssetClass, setSelectedAssetClass] = useState('all');
  const [includeStablecoins, setIncludeStablecoins] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
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
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B${unit}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${unit}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${unit}`;
    }
    return `${num}${unit}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatChange = (change: number, showArrow: boolean = true) => {
    const isPositive = change >= 0;
    const arrow = showArrow ? (isPositive ? '▲' : '▼') : '';
    return (
      <span className={`inline-flex items-center text-sm font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {arrow && <span className="mr-1">{arrow}</span>}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  const getTransferTypeColor = (type: string) => {
    switch (type) {
      case 'mint': return 'bg-green-100 text-green-800';
      case 'burn': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getNetworkIcon = (network: string) => {
    // 这里可以返回真实的网络图标
    return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 仿照 rwa.xyz */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">RWA情报港</h1>
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                实时更新
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索资产、发行方、协议... (⌘K)"
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageCirclePlus className="w-4 h-4 mr-2" />
                发起讨论
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 核心指标面板 - 仿照 rwa.xyz 的关键指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total RWA Onchain</p>
                  <p className="text-3xl font-bold text-gray-900">${realTimeMarketData.totalRwaValue}B</p>
                  <div className="mt-2 flex items-center">
                    {formatChange(realTimeMarketData.totalRwaValueChange)}
                    <span className="text-xs text-gray-500 ml-2">vs 上周</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">New Issuance Volume</p>
                  <p className="text-3xl font-bold text-gray-900">${realTimeMarketData.newIssuanceVolume}B</p>
                  <div className="mt-2 flex items-center">
                    {formatChange(realTimeMarketData.newIssuanceChange)}
                    <span className="text-xs text-gray-500 ml-2">7 days</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Asset Holders</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(realTimeMarketData.totalAssetHolders)}</p>
                  <div className="mt-2 flex items-center">
                    {formatChange(realTimeMarketData.totalHoldersChange)}
                    <span className="text-xs text-gray-500 ml-2">vs 上月</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Protocols</p>
                  <p className="text-3xl font-bold text-gray-900">{realTimeMarketData.activeProtocols}</p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">{realTimeMarketData.totalIssuers} 发行方</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Building2 className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：图表和分析 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 时间序列图表 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">RWA 价值趋势</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1D</SelectItem>
                        <SelectItem value="7d">7D</SelectItem>
                        <SelectItem value="30d">30D</SelectItem>
                        <SelectItem value="90d">90D</SelectItem>
                        <SelectItem value="1y">1Y</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">图表加载中...</p>
                    <p className="text-xs text-gray-400 mt-1">集成 Highcharts 或 Chart.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 热门转账 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">热门转账</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      $0-$100M
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {topTransfers.map((transfer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getNetworkIcon(transfer.network)}
                          <span className="font-medium text-sm">{transfer.asset}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTransferTypeColor(transfer.type)}`}
                        >
                          {transfer.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(transfer.usdValue)}</div>
                        <div className="text-xs text-gray-500">{transfer.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RWA 联盟表 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">RWA 联盟表</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id="includeStablecoins"
                        checked={includeStablecoins}
                        onChange={(e) => setIncludeStablecoins(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="includeStablecoins" className="text-xs text-gray-600">
                        Include Stablecoins
                      </label>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-600">#</th>
                        <th className="text-left py-2 font-medium text-gray-600">发行方</th>
                        <th className="text-left py-2 font-medium text-gray-600">资产</th>
                        <th className="text-right py-2 font-medium text-gray-600">总价值</th>
                        <th className="text-right py-2 font-medium text-gray-600">24h 变化</th>
                        <th className="text-right py-2 font-medium text-gray-600">持有者</th>
                        <th className="text-center py-2 font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rwaLeagueTable.map((item) => (
                        <tr key={item.rank} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 font-medium">{item.rank}</td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                              <span className="font-medium">{item.issuer}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{item.asset}</div>
                              <div className="text-xs text-gray-500">{item.assetClass}</div>
                            </div>
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(item.totalValue)}
                          </td>
                          <td className="py-3 text-right">
                            {formatChange(item.change24h)}
                          </td>
                          <td className="py-3 text-right">
                            {formatNumber(item.holders)}
                          </td>
                          <td className="py-3 text-center">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：导航和快速信息 */}
          <div className="space-y-6">
            {/* 资产类别导航 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">资产类别</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {assetClasses.map((asset, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${asset.color}`}></div>
                        <div>
                          <div className="font-medium text-sm">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">${asset.value}B</div>
                        <div className="text-xs">{formatChange(asset.change, false)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 最新资讯 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">最新资讯</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm mb-1">Circle 推出新的 USDC 铸造功能</div>
                    <div className="text-xs text-gray-500">2小时前</div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm mb-1">美国财政部发布稳定币监管指引</div>
                    <div className="text-xs text-gray-500">4小时前</div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm mb-1">私募信贷代币化市场增长迅速</div>
                    <div className="text-xs text-gray-500">6小时前</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Calculator className="w-4 h-4 mr-2" />
                    RWA评估工具
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    风险计算器
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    研究报告
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Brain className="w-4 h-4 mr-2" />
                    AI分析助手
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 页面底部信息 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              最后更新: {new Date(realTimeMarketData.lastUpdated).toLocaleString('zh-CN')}
            </div>
            <div className="flex items-center space-x-4">
              <span>数据来源: 多链聚合</span>
              <Button variant="ghost" size="sm" className="text-xs">
                报告数据错误
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
