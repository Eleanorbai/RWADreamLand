import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

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
export default ProjectMembersTab;
