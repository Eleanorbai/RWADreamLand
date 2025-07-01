import { useState } from 'react';
import { OpenProject, OpenProjectUpdate } from '@/types';
import axios from 'axios';

export function useUpdateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = async (projectId: number, data: OpenProjectUpdate): Promise<OpenProject | null> => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/open-projects/${projectId}`, data);
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { updateProject, loading, error };
} 