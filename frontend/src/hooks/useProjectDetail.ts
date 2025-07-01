import { useEffect, useState } from 'react';
import { OpenProject } from '@/types';
import axios from 'axios';

export function useProjectDetail(projectId: number) {
  const [project, setProject] = useState<OpenProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    axios.get(`/api/open-projects/${projectId}`)
      .then(res => setProject(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { project, loading, error, setProject };
} 