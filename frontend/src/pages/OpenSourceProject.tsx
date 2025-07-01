import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import * as Icons from 'lucide-react';
import { openSourceApi } from '@/lib/api';
import { 
  OpenProject, 
  GitHubContribution, 
  ContributorRanking, 
  ProjectStats,
  contributionTypeLabels,
  contributionStatusLabels
} from '@/types/opensource';
import { useToast } from '@/hooks/use-toast';
import { useProjectMemberStatus } from "@/hooks/useProjectMemberStatus";
import axios from "axios";

const OpenSourceProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<OpenProject | null>(null);
  const [contributions, setContributions] = useState<GitHubContribution[]>([]);
  const [rankings, setRankings] = useState<ContributorRanking[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [errorType, setErrorType] = useState<null | "notfound" | "forbidden">(null);

  const { status, loading: memberLoading } = useProjectMemberStatus(project?.id || 0);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData(parseInt(projectId));
    }
  }, [projectId]);

  const loadProjectData = async (id: number) => {
    try {
      setLoading(true);
      setErrorType(null);
      const [projectData, contributionsData, rankingsData, statsData, activitiesData] = await Promise.all([
        openSourceApi.getProject(id),
        openSourceApi.getContributions(id, undefined, undefined, 0, 50),
        openSourceApi.getContributorRankings(20),
        openSourceApi.getProjectStats(id),
        openSourceApi.getRecentActivities(id, 30)
      ]);
      
      setProject(projectData);
      setContributions(Array.isArray(contributionsData) ? contributionsData : []);
      setRankings(Array.isArray(rankingsData) ? rankingsData : []);
      setStats(statsData);
      setActivities(activitiesData.activities || []);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setErrorType("notfound");
      } else if (error?.response?.status === 403) {
        setErrorType("forbidden");
      } else {
        console.error('Failed to load project data:', error);
        toast({
          title: "加载失败",
          description: "无法加载项目数据，请稍后重试",
          variant: "destructive",
        });
      }
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncContributions = async () => {
    if (!projectId) return;
    
    try {
      const result = await openSourceApi.syncContributions(parseInt(projectId));
      toast({
        title: "同步成功",
        description: result.message || JSON.stringify(result),
      });
      // 重新加载数据
      loadProjectData(parseInt(projectId));
    } catch (error) {
      console.error('Failed to sync contributions:', error);
      toast({
        title: "同步失败",
        description: "无法同步GitHub贡献，请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(`/api/open-projects/${projectId}/members`);
      toast({
        title: "申请已提交",
        description: "请等待管理员审核",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e: any) {
      toast({
        title: "申请失败",
        description: e?.response?.data?.detail || "未知错误",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  // 渲染前容错
  const safeContributions = Array.isArray(contributions) ? contributions : [];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载项目信息中...</p>
        </div>
      </div>
    );
  }

  if (errorType === "notfound") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h1>
        <Button onClick={() => navigate('/origin')}>返回原点馆</Button>
      </div>
    );
  }

  if (errorType === "forbidden") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">您不是项目成员</h1>
        <p className="mb-4 text-gray-600">可以先看看其他项目，或申请加入该项目。</p>
        <Button onClick={() => navigate('/origin')}>返回原点馆</Button>
        <Button onClick={handleApply} className="ml-4">申请加入项目</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 项目头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Icons.GitBranch className="h-6 w-6" />
                {project.name}
              </CardTitle>
              <p className="text-gray-600">{project.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <a 
                  href={project.github_repo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <Icons.Github className="h-4 w-4" />
                  GitHub仓库
                  <Icons.ExternalLink className="h-3 w-3" />
                </a>
                <span className="flex items-center gap-1">
                  <Icons.Calendar className="h-4 w-4" />
                  创建于 {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSyncContributions}>
                同步GitHub数据
              </Button>
              <Badge variant={project.is_public ? "default" : "secondary"}>
                {project.is_public ? "公开" : "私有"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!memberLoading && status === "NOT_MEMBER" && (
        <Button onClick={handleApply} disabled={applying} className="mt-4">
          {applying ? "申请中..." : "申请加入项目"}
        </Button>
      )}
      {!memberLoading && status === "PENDING" && (
        <Button disabled className="mt-4">已申请，等待审核</Button>
      )}
      {!memberLoading && status === "APPROVED" && (
        <Button disabled className="mt-4">已是项目成员</Button>
      )}
      {!memberLoading && status === "ADMIN" && (
        <Button disabled className="mt-4">你是项目管理员</Button>
      )}

      {/* 项目统计 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总贡献数</p>
                  <p className="text-2xl font-bold">{stats.total_contributions}</p>
                </div>
                <Icons.GitBranch className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">贡献者数</p>
                  <p className="text-2xl font-bold">{stats.total_contributors}</p>
                </div>
                <Icons.Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总积分</p>
                  <p className="text-2xl font-bold">{stats.total_points}</p>
                </div>
                <Icons.Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃度</p>
                  <p className="text-2xl font-bold text-green-600">高</p>
                </div>
                <Icons.TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">项目概览</TabsTrigger>
          <TabsTrigger value="contributions">贡献记录</TabsTrigger>
          <TabsTrigger value="blockchain">区块链确权</TabsTrigger>
          <TabsTrigger value="live">实时动态</TabsTrigger>
          <TabsTrigger value="contributors">贡献者</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 最近贡献 */}
            <Card>
              <CardHeader>
                <CardTitle>最近贡献</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(safeContributions ?? []).slice(0, 5).map((contribution) => (
                    <div key={contribution.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://github.com/${contribution.github_username}.png`} />
                        <AvatarFallback>{contribution.github_username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{contribution.issue_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {contributionTypeLabels[contribution.contribution_type]}
                          </Badge>
                          <Badge variant={contribution.status === 'accepted' ? 'default' : 'secondary'} className="text-xs">
                            {contributionStatusLabels[contribution.status]}
                          </Badge>
                          <span className="text-xs text-gray-500">+{contribution.contribution_points}分</span>
                        </div>
                        <a 
                          href={contribution.issue_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          查看Issue
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 顶级贡献者 */}
            <Card>
              <CardHeader>
                <CardTitle>顶级贡献者</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(stats?.top_contributors ?? []).slice(0, 5).map((contributor, index) => (
                    <div key={contributor.user_id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://github.com/${contributor.github_username}.png`} />
                        <AvatarFallback>{contributor.github_username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contributor.github_username}</p>
                        <p className="text-xs text-gray-500">
                          {contributor.contributions}个贡献 · {contributor.points}积分
                        </p>
                      </div>
                      <Icons.Award className="h-4 w-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>所有贡献记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeContributions.map((contribution) => (
                  <div key={contribution.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={`https://github.com/${contribution.github_username}.png`} />
                          <AvatarFallback>{contribution.github_username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{contribution.issue_title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            由 {contribution.github_username} 提交 · Issue #{contribution.issue_number}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {contributionTypeLabels[contribution.contribution_type]}
                            </Badge>
                            <Badge variant={contribution.status === 'accepted' ? 'default' : 'secondary'}>
                              {contributionStatusLabels[contribution.status]}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(contribution.github_created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{contribution.contribution_points}分</p>
                        <a 
                          href={contribution.issue_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          查看详情
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 区块链确权流程 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Shield className="h-5 w-5 text-blue-600" />
                  贡献确权流程
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">GitHub提交</p>
                      <p className="text-sm text-gray-600">在GitHub仓库提交Issue或PR</p>
                    </div>
                    <Icons.Github className="h-5 w-5 text-blue-600 ml-auto" />
                  </div>
                  
                  <div className="flex justify-center">
                    <Icons.ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">社区审核</p>
                      <p className="text-sm text-gray-600">管理员审核并接受贡献</p>
                    </div>
                    <Icons.CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  </div>
                  
                  <div className="flex justify-center">
                    <Icons.ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">链上确权</p>
                      <p className="text-sm text-gray-600">贡献记录永久上链存储</p>
                    </div>
                    <Icons.Link className="h-5 w-5 text-purple-600 ml-auto" />
                  </div>
                  
                  <div className="flex justify-center">
                    <Icons.ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600 text-white text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium">积分奖励</p>
                      <p className="text-sm text-gray-600">获得对应积分和声誉提升</p>
                    </div>
                    <Icons.Star className="h-5 w-5 text-yellow-600 ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 已确权贡献记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.CheckCircle className="h-5 w-5 text-green-600" />
                  已确权贡献记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(safeContributions.filter(c => c.blockchain_hash) ?? []).slice(0, 8).map((contribution) => (
                    <div key={contribution.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://github.com/${contribution.github_username}.png`} />
                        <AvatarFallback>{contribution.github_username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{contribution.issue_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {contributionTypeLabels[contribution.contribution_type]}
                          </Badge>
                          <span className="text-xs text-green-600 font-medium">+{contribution.contribution_points}分</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          链上哈希: {contribution.blockchain_hash?.slice(0, 10)}...{contribution.blockchain_hash?.slice(-8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">已确权</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 区块链网络状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Activity className="h-5 w-5 text-blue-600" />
                FISCO BCOS网络状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">正常</div>
                  <div className="text-sm text-gray-600">网络状态</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{safeContributions.filter(c => c.blockchain_hash).length}</div>
                  <div className="text-sm text-gray-600">已上链记录</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2-3秒</div>
                  <div className="text-sm text-gray-600">平均确认时间</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">99.9%</div>
                  <div className="text-sm text-gray-600">网络可用性</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 实时贡献动态 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.Zap className="h-5 w-5 text-orange-600" />
                    实时贡献动态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activity.user?.avatar} />
                          <AvatarFallback>{activity.user?.github_username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{activity.user?.github_username}</span>
                            <span className="text-sm text-gray-600">{activity.action}</span>
                            {activity.is_on_chain && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                <Icons.CheckCircle className="h-3 w-3 mr-1" />
                                已上链
                              </Badge>
                            )}
                            {!activity.is_on_chain && activity.status === 'accepted' && (
                              <Badge variant="secondary" className="text-xs">
                                <Icons.Clock className="h-3 w-3 mr-1" />
                                待上链
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{activity.title}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-green-600 font-medium">+{activity.points}积分</span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString()}
                            </span>
                            {activity.blockchain_hash && (
                              <span className="text-xs text-blue-600">
                                哈希: {activity.blockchain_hash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 多方参与统计 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.Users className="h-5 w-5 text-blue-600" />
                    多方参与统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 个人参与者 */}
                    <div className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">个人开发者</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {(rankings ?? []).filter(r => !r.user?.full_name?.includes('公司')).length}
                      </div>
                      <div className="text-xs text-gray-600">活跃个人贡献者</div>
                    </div>

                    {/* 企业参与者 */}
                    <div className="border rounded-lg p-3 bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Building className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">企业组织</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {(rankings ?? []).filter(r => r.user?.full_name?.includes('公司') || r.github_username.includes('corp')).length}
                      </div>
                      <div className="text-xs text-gray-600">参与企业数量</div>
                    </div>

                    {/* 总贡献统计 */}
                    <div className="border rounded-lg p-3 bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Trophy className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">总贡献量</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.total_contributions || 0}
                      </div>
                      <div className="text-xs text-gray-600">累计贡献次数</div>
                    </div>

                    {/* 链上确权率 */}
                    <div className="border rounded-lg p-3 bg-orange-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Shield className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-sm">链上确权率</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats?.total_contributions ? 
                          Math.round((safeContributions.filter(c => c.blockchain_hash).length / stats.total_contributions) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-600">贡献确权比例</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 快速参与指南 */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">💡 如何参与贡献</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span>访问GitHub仓库提交Issue</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">2.</span>
                    <span>等待社区管理员审核</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">3.</span>
                    <span>获得积分并自动上链确权</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => window.open('https://github.com/Eleanorbai/RWADreamLand/issues/new', '_blank')}
                  >
                    立即参与贡献
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>贡献者排行榜</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(rankings ?? []).map((ranking) => (
                  <div key={ranking.user_id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                      {ranking.rank}
                    </div>
                    <Avatar>
                      <AvatarImage src={`https://github.com/${ranking.github_username}.png`} />
                      <AvatarFallback>{ranking.github_username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{ranking.github_username}</h4>
                      <p className="text-sm text-gray-600">
                        声誉分数: {ranking.reputation_score.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{ranking.total_points}积分</p>
                      <p className="text-sm text-gray-600">{ranking.total_contributions}个贡献</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 贡献类型分析 */}
            <Card>
              <CardHeader>
                <CardTitle>贡献类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.contribution_types ?? {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{contributionTypeLabels[type as keyof typeof contributionTypeLabels] || type}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count / stats.total_contributions) * 100} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 项目活跃度 */}
            <Card>
              <CardHeader>
                <CardTitle>项目活跃度指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>参与度</span>
                    <span className="font-bold text-green-600">高</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>贡献质量</span>
                    <span className="font-bold text-blue-600">优秀</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>社区活跃度</span>
                    <span className="font-bold text-purple-600">活跃</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>增长趋势</span>
                    <span className="font-bold text-orange-600">上升</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpenSourceProject;
