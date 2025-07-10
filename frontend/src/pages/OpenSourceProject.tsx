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
import api from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { toast } from "react-toastify";

// 占位组件
const ProjectOverview = ({ projectId }) => <div>项目详情内容占位（ProjectOverview）</div>;

const ProjectContributions = ({ projectId }) => <div>贡献记录内容（可扩展）</div>;
const ProjectBlockchain = ({ projectId }) => <div>区块链确权内容（可扩展）</div>;
const ProjectLive = ({ projectId }) => <div>实时动态内容（可扩展）</div>;
const ProjectContributors = ({ projectId }) => <div>贡献者内容（可扩展）</div>;
const ProjectAnalytics = ({ projectId }) => <div>数据分析内容（可扩展）</div>;

const MyContributions = ({ projectId }) => <div>我的贡献内容占位（MyContributions）</div>;

const ProjectMembersTab = ({ projectId }) => {
  const [members, setMembers] = useState([]);

  const fetchMembers = () => {
    api.get(`/api/open-projects/${projectId}/members`).then(res => setMembers(res.data));
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleApprove = (memberId) => {
    api.post(`/api/open-projects/${projectId}/members/${memberId}/approve`)
      .then(() => {
        toast.success("审批通过");
        fetchMembers();
      });
  };

  const handleReject = (memberId) => {
    api.post(`/api/open-projects/${projectId}/members/${memberId}/reject`)
      .then(() => {
        toast.info("已拒绝");
        fetchMembers();
      });
  };

  return (
    <div>
      <h3>项目成员</h3>
      <table>
        <thead>
          <tr>
            <th>用户名</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id}>
              <td>{m.user?.username || m.user_id}</td>
              <td>{m.role}</td>
              <td>{m.status}</td>
              <td>
                {m.status === "PENDING" && (
                  <>
                    <button onClick={() => handleApprove(m.id)}>同意</button>
                    <button onClick={() => handleReject(m.id)}>拒绝</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const statusColor = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const ProjectReviewTab = ({ projectId, onReviewChange }) => {
  console.log('ProjectReviewTab mounted', projectId); // 调试用
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContributions = () => {
    console.log('fetchContributions called', projectId);
    openSourceApi.getContributions(projectId, undefined, "PENDING")
      .then(data => {
        console.log('openSourceApi.getContributions then', data);
        data.forEach((c, i) => console.log(`contribution[${i}] status:`, c.status));
        setContributions(data);
      })
      .catch(err => {
        console.error('openSourceApi.getContributions error', err);
      });
  };

  useEffect(() => {
    console.log('useEffect triggered', projectId); // 调试用
    fetchContributions();
  }, [projectId]);

  const handleApprove = (id) => {
    api.put(`/api/github-contributions/${id}/accept`).then(() => {
      toast.success("已通过");
      fetchContributions();
      onReviewChange && onReviewChange();
    });
  };
  const handleReject = (id) => {
    api.put(`/api/github-contributions/${id}/reject`).then(() => {
      toast.info("已拒绝");
      fetchContributions();
      onReviewChange && onReviewChange();
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-4">贡献审核</h3>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">贡献人</th>
              <th className="px-4 py-2 text-left">标题</th>
              <th className="px-4 py-2 text-left">类型</th>
              <th className="px-4 py-2 text-left">积分</th>
              <th className="px-4 py-2 text-left">状态</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">加载中...</td></tr>
            ) : contributions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">暂无待审核贡献</td></tr>
            ) : (
              contributions.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img src={c.user?.avatar_url || `https://github.com/${c.github_username}.png`} alt={c.github_username} className="w-8 h-8 rounded-full" />
                    <span>{c.github_username || c.user?.username}</span>
                  </td>
                  <td className="px-4 py-2">{c.issue_title}</td>
                  <td className="px-4 py-2">{c.contribution_type}</td>
                  <td className="px-4 py-2">{c.contribution_points}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor[c.status.toUpperCase()] || "bg-gray-100 text-gray-800"}`}>
                      {c.status.toLowerCase() === "pending" ? "待审核" : c.status.toLowerCase() === "accepted" ? "已通过" : "已拒绝"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {c.status && c.status.toLowerCase() === "pending" && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={() => handleApprove(c.id)}>通过</button>
                        <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition" onClick={() => handleReject(c.id)}>拒绝</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProjectTeamTab = ({ projectId }) => <div>团队配置内容占位（ProjectTeamTab）</div>;

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

  // const { status, loading: memberLoading } = useProjectMemberStatus(project?.id || 0);
  const [applying, setApplying] = useState(false);

  const { user } = useUser();
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [memberLoading, setMemberLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (projectId) {
      loadProjectData(parseInt(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !user?.id) return;
    setMemberLoading(true);
    api.get(`/api/open-projects/${projectId}/members`).then(res => {
      const mine = res.data.find((m: any) => String(m.user_id) === String(user.id));
      setMemberInfo(mine);
      console.log("渲染时的 memberInfo:", mine);
    }).finally(() => setMemberLoading(false));
  }, [projectId, user?.id]);

  const isProjectAdmin = memberInfo?.role === "ADMIN" && memberInfo?.status === "APPROVED";
  const isPlatformAdmin = user?.role === "admin" || user?.role === "community_manager";

  console.log('isProjectAdmin', isProjectAdmin, 'isPlatformAdmin', isPlatformAdmin, 'memberInfo', memberInfo, 'user', user);

  const loadProjectData = async (id: number) => {
    try {
      setLoading(true);
      setErrorType(null);
      // 只要是项目admin或平台admin，都能加载全部贡献
      const contributionsData = await openSourceApi.getContributions(id, undefined, undefined, 0, 50);
      const [projectData, rankingsData, statsData, activitiesData] = await Promise.all([
        openSourceApi.getProject(id),
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
      await api.post(`/api/open-projects/${projectId}/members`);
      toast({
        title: "申请已提交",
        description: "请等待管理员审核",
      });
      // 申请后刷新成员信息
      api.get(`/api/open-projects/${projectId}/members`).then(res => {
        const mine = res.data.find((m: any) => String(m.user_id) === String(user.id));
        setMemberInfo(mine);
      });
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

  const fetchPendingCount = async () => {
    if (!projectId) return;
    try {
      const res = await api.get(`/api/open-projects/${projectId}/contributions/pending-count`);
      setPendingCount(res.data.count);
    } catch (e) {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "review") {
      fetchPendingCount();
    }
  }, [activeTab]);

  if (loading || memberLoading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  if (errorType === "notfound") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h1>
        <Button onClick={() => navigate('/origin')}>返回孵化舱</Button>
      </div>
    );
  }

  if (errorType === "forbidden") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">您不是项目成员</h1>
        <p className="mb-4 text-gray-600">可以先看看其他项目，或申请加入该项目。</p>
        <Button onClick={() => navigate('/origin')}>返回孵化舱</Button>
        <Button onClick={handleApply} className="ml-4">申请加入项目</Button>
      </div>
    );
  }

  if (!memberInfo) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">您不是项目成员</h1>
        <Button onClick={handleApply} disabled={applying} className="ml-4">
          {applying ? "申请中..." : "申请加入项目"}
        </Button>
      </div>
    );
  }
  if (memberInfo.status === "PENDING") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">已申请，等待管理员审批</h1>
        <Button disabled className="mt-4">已申请，等待审核</Button>
      </div>
    );
  }
  if (memberInfo.status === "REJECTED") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">您的申请被拒绝</h1>
        <Button onClick={handleApply} disabled={applying} className="ml-4">
          {applying ? "重新申请中..." : "重新申请"}
        </Button>
      </div>
    );
  }

  // 新增：project 判空，防止访问 null 属性
  if (!project) {
    return <div className="text-center py-16">项目数据加载中...</div>;
  }

  // Tab配置
  const tabs = [
    { value: "overview", label: "项目概览" },
    { value: "contributions", label: "贡献记录" },
    { value: "blockchain", label: "区块链确权" },
    { value: "members", label: "成员管理" },
    { value: "review", label: "贡献审核" },
    { value: "team", label: "团队配置" },
    { value: "live", label: "实时动态" },
    { value: "contributors", label: "贡献者" },
    { value: "analytics", label: "数据分析" },
  ];

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <div className="overflow-x-auto border-b bg-white">
          <div className="flex space-x-2 min-w-max px-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                className={`px-4 py-2 rounded-t-md font-medium transition whitespace-nowrap
                  ${activeTab === tab.value
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'bg-gray-50 text-gray-500 hover:text-blue-500'}
                `}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {tab.value === "review" && pendingCount > 0 && (
                  <span className="ml-1 inline-block min-w-[18px] h-5 px-1 bg-red-500 text-white text-xs rounded-full text-center align-middle">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <TabsContent value="overview"><ProjectOverview projectId={project.id} /></TabsContent>
        <TabsContent value="contributions"><ProjectContributions projectId={project.id} /></TabsContent>
        <TabsContent value="blockchain"><ProjectBlockchain projectId={project.id} /></TabsContent>
        <TabsContent value="live"><ProjectLive projectId={project.id} /></TabsContent>
        <TabsContent value="contributors"><ProjectContributors projectId={project.id} /></TabsContent>
        <TabsContent value="analytics"><ProjectAnalytics projectId={project.id} /></TabsContent>
        {(isProjectAdmin || isPlatformAdmin) && <TabsContent value="members"><ProjectMembersTab projectId={project.id} /></TabsContent>}
        {(isProjectAdmin || isPlatformAdmin) && 
          <TabsContent value="review">
            <ProjectReviewTab projectId={project.id} onReviewChange={fetchPendingCount} />
          </TabsContent>
        }
        {(isProjectAdmin || isPlatformAdmin) && <TabsContent value="team"><ProjectTeamTab projectId={project.id} /></TabsContent>}
      </Tabs>
    </div>
  );
};

export default OpenSourceProject;
