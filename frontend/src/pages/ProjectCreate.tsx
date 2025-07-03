import { useNavigate } from "react-router-dom";

const ProjectCreate = () => {
  const navigate = useNavigate();
  // ... 省略表单逻辑 ...
  const handleSubmit = async (formData) => {
    // ... 提交表单到后端 ...
    const res = await api.post("/api/open-projects", formData);
    // 新建成功后自动跳转到管理页
    navigate(`/open-source/${res.data.id}?tab=manage`);
  };
  // ... 省略表单渲染 ...
};
