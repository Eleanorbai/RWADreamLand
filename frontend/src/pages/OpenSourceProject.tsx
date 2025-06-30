import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ExternalLink, 
  GitHub, 
  Users, 
  Trophy, 
  Star, 
  GitBranch,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
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

const OpenSourceProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<OpenProject | null>(null);
  const [contributions, setContributions] = useState<GitHubContribution[]>([]);
  const [rankings, setRankings] = useState<ContributorRanking[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProjectData(parseInt(projectId));
    }
  }, [projectId]);

  const loadProjectData = async (id: number) => {
    try {
      setLoading(true);
      const [projectData, contributionsData, rankingsData, statsData] = await Promise.all([
        openSourceApi.getProject(id),
        openSourceApi.getContributions(id, undefined, undefined, 0, 50),
        openSourceApi.getContributorRankings(20),
        openSourceApi.getProjectStats(id)
      ]);
      
      setProject(projectData);
      setContributions(contributionsData);
      setRankings(rankingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load project data:', error);
      toast({
        title: "加载失败",
        description: "无法加载项目数据，请稍后重试",
        variant: "destructive",
      });
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
        description: result.msg,
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

  if (!project) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h1>
        <Button onClick={() => navigate('/origin')}>
          返回原点馆
        </Button>
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
                <GitBranch className="h-6 w-6" />
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
                  <GitHub className="h-4 w-4" />
                  GitHub仓库
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  创建于 {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSyncContributions}>
                同步GitHub数据
              </Button>
              <Badge variant={project.is_active ? "default" : "secondary"}>
                {project.is_active ? "活跃" : "停用"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

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
                <GitBranch className="h-8 w-8 text-blue-600" />
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
                <Users className="h-8 w-8 text-green-600" />
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
                <Star className="h-8 w-8 text-yellow-600" />
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
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 详细信息标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">项目概览</TabsTrigger>
          <TabsTrigger value="contributions">贡献记录</TabsTrigger>
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
                  {contributions.slice(0, 5).map((contribution) => (
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
                  {stats?.top_contributors.slice(0, 5).map((contributor, index) => (
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
                      <Award className="h-4 w-4 text-yellow-600" />
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
                {contributions.map((contribution) => (
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

        <TabsContent value="contributors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>贡献者排行榜</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((ranking) => (
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
                  {stats && Object.entries(stats.contribution_types).map(([type, count]) => (
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
