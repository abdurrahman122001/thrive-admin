import { useState, useCallback } from 'react';
import axios from 'axios';
import { ContentData, About, Service, TeamMember } from '../../types';

interface FetchResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useApiFetch = <T>(
  type: 'services' | 'team' | 'abouts',
  initialData: T[],
  contentData: ContentData,
  updateContent: (data: ContentData) => void
): FetchResult<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchData = useCallback(async () => {
    const endpoint = type === 'services' ? 'services' : type === 'team' ? 'teams/list' : 'abouts';
    if (data.length > 0 || retryCount >= maxRetries) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/${endpoint}`, {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('thriveAuth') || ''}`,
        },
      });
      setLoading(false);
      let updatedData = response.data;
      if (type === 'team' || type === 'abouts') {
        updatedData = response.data.map((item: About | TeamMember) => ({
          ...item,
          image: item.image ? `http://127.0.0.1:8000/storage/${item.image}` : '',
        }));
      }
      setData(updatedData);
      if (type === 'services') {
        updateContent({ ...contentData, services: updatedData });
      } else if (type === 'team') {
        updateContent({ ...contentData, team: updatedData });
      } else if (type === 'abouts') {
        updateContent({ ...contentData, about: updatedData[0] || contentData.about });
      }
      setError(null);
      setRetryCount(0);
    } catch (err: any) {
      setLoading(false);
      if (err.response?.status === 429 && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 2000;
        console.log(`Rate limit hit for ${type}. Retrying in ${delay / 1000} seconds...`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchData();
        }, delay);
      } else {
        setError(`Failed to fetch ${type}: ${err.message}`);
        console.error(`Error fetching ${type}:`, err);
      }
    }
  }, [type, data.length, retryCount, contentData, updateContent]);

  return { data, loading, error, fetchData };
};