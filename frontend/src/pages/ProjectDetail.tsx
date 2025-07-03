import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import ProjectOverview from "@/components/pages/ProjectDetail/ProjectOverview";
import MyContributions from "@/components/pages/ProjectDetail/MyContributions";
import ProjectMembersTab from "@/components/pages/ProjectDetail/ProjectMembersTab";
import ProjectReviewTab from "@/components/pages/ProjectDetail/ProjectReviewTab";
import ProjectTeamTab from "@/components/pages/ProjectDetail/ProjectTeamTab";

const ProjectDetail = ({ projectId }) => {
  const { user } = useUser();
  const [memberInfo, setMemberInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(true);

  const fetchMemberInfo = () => {
    api.get(`/api/open-projects/${projectId}/members`).then(res => {
      console.log("当前用户：", user);
      console.log("项目成员列表：", res.data);
      const mine = res.data.find(m => String(m.user_id) === String(user.id));
      setMemberInfo(mine);
    }).finally(() => setMemberLoading(false));
  };

  useEffect(() => {
    fetchMemberInfo();
    // eslint-disable-next-line
  }, [projectId, user.id]);

  const isAdmin = memberInfo?.role === "ADMIN" && memberInfo?.status === "APPROVED";
  const isMember = memberInfo?.status === "APPROVED";

  const handleApply = () => {
    setLoading(true);
    api.post(`/api/open-projects/${projectId}/members`).then(() => {
      toast.success("申请已提交，等待管理员审批");
      fetchMemberInfo();
    }).catch(err => {
      toast.error(err.response?.data?.detail || "申请失败");
      fetchMemberInfo();
    }).finally(() => setLoading(false));
  };

  // 身份判断逻辑
  if (memberLoading) {
    return <div className="text-center py-16">加载成员信息中...</div>;
  }
  if (!memberInfo) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">您不是项目成员</h2>
        <p className="mb-6 text-gray-500">可以先看看其他项目，或申请加入该项目。</p>
        <button className="btn mr-4" onClick={() => window.history.back()}>返回原点馆</button>
        <button className="btn" onClick={handleApply} disabled={loading}>申请加入项目</button>
      </div>
    );
  }
  if (memberInfo.status === "PENDING") {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">已申请，等待管理员审批</h2>
        <p className="mb-6 text-gray-500">请耐心等待项目管理员审核。</p>
        <button className="btn" onClick={() => window.history.back()}>返回原点馆</button>
      </div>
    );
  }
  if (memberInfo.status === "REJECTED") {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">您的申请被拒绝</h2>
        <p className="mb-6 text-gray-500">如有疑问可联系项目管理员，或重新申请。</p>
        <button className="btn mr-4" onClick={() => window.history.back()}>返回原点馆</button>
        <button className="btn" onClick={handleApply} disabled={loading}>重新申请</button>
      </div>
    );
  }
  // status === "APPROVED"，正常显示项目内容
  return (
    <div>
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as string)} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">项目详情</TabsTrigger>
          <TabsTrigger value="my-contributions">我的贡献</TabsTrigger>
          {isAdmin && <TabsTrigger value="members">成员管理</TabsTrigger>}
          {isAdmin && <TabsTrigger value="review">贡献审核</TabsTrigger>}
          {isAdmin && <TabsTrigger value="team">团队配置</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview"><ProjectOverview projectId={projectId} /></TabsContent>
        <TabsContent value="my-contributions"><MyContributions projectId={projectId} /></TabsContent>
        {isAdmin && <TabsContent value="members"><ProjectMembersTab projectId={projectId} /></TabsContent>}
        {isAdmin && <TabsContent value="review"><ProjectReviewTab projectId={projectId} /></TabsContent>}
        {isAdmin && <TabsContent value="team"><ProjectTeamTab projectId={projectId} /></TabsContent>}
      </Tabs>
    </div>
  );
};
