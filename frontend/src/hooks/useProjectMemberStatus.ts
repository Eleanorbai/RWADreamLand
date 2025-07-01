// workspace4/frontend/src/hooks/useProjectMemberStatus.ts
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser"; // 假设有全局用户信息
import axios from "axios";

export type MemberStatus = "NOT_MEMBER" | "PENDING" | "APPROVED" | "ADMIN";

export function useProjectMemberStatus(projectId: number) {
  const { user } = useUser();
  const [status, setStatus] = useState<MemberStatus>("NOT_MEMBER");
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    if (!user || !projectId) return;
    setLoading(true);
    axios
      .get(`/api/open-projects/${projectId}/members`)
      .then((res) => {
        const members = res.data;
        const me = members.find((m: any) => m.user_id === userId);
        if (!me) setStatus("NOT_MEMBER");
        else if (me.status === "PENDING") setStatus("PENDING");
        else if (me.role === "ADMIN") setStatus("ADMIN");
        else if (me.status === "APPROVED") setStatus("APPROVED");
      })
      .catch(() => setStatus("NOT_MEMBER"))
      .finally(() => setLoading(false));
  }, [user, projectId]);

  return { status, loading };
}