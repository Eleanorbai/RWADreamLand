import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

const ProjectReviewTab = ({ projectId }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContributions = () => {
    setLoading(true);
    api.get(`/api/open-projects/${projectId}/contributions`).then(res => setContributions(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContributions();
  }, [projectId]);

  const handleApprove = (id) => {
    api.put(`/api/github-contributions/${id}/accept`).then(() => {
      toast.success("已通过");
      fetchContributions();
    });
  };
  const handleReject = (id) => {
    api.put(`/api/github-contributions/${id}/reject`).then(() => {
      toast.info("已拒绝");
      fetchContributions();
    });
  };

  return (
    <div>
      <h3>贡献审核</h3>
      {loading ? <div>加载中...</div> : (
        <table>
          <thead>
            <tr>
              <th>贡献人</th>
              <th>标题</th>
              <th>类型</th>
              <th>积分</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map(c => (
              <tr key={c.id}>
                <td>{c.github_username || c.user_id}</td>
                <td>{c.issue_title}</td>
                <td>{c.contribution_type}</td>
                <td>{c.contribution_points}</td>
                <td>{c.status}</td>
                <td>
                  {c.status === "PENDING" && (
                    <>
                      <button onClick={() => handleApprove(c.id)}>通过</button>
                      <button onClick={() => handleReject(c.id)}>拒绝</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ProjectReviewTab; 