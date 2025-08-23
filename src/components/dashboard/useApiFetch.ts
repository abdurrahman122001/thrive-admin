import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { ContentData, About, Service, TeamMember } from "../../types";

interface FetchResult<T extends Service | TeamMember | About> {
  data: T[];
  loading: boolean;
  error: string | null;
  fetchData: (force?: boolean) => Promise<void>;
  retry: () => void;
}

export const useApiFetch = <T extends Service | TeamMember | About>(
  type: "services" | "team" | "abouts",
  initialData: T[],
  contentData: ContentData,
  updateContent: (data: ContentData) => void
): FetchResult<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes
  const lastFetched = useRef<number | null>(null);

  const contentDataRef = useRef(contentData);
  const updateContentRef = useRef(updateContent);

  contentDataRef.current = contentData;
  updateContentRef.current = updateContent;

  const API_URL = import.meta.env.VITE_API_URL || "https://thriveenterprisesolutions.com.au/admin";

  const fetchData = useCallback(async (force: boolean = false) => {
    const endpoint =
      type === "services"
        ? "services"
        : type === "team"
        ? "teams/list"
        : "abouts";

    const now = Date.now();
    if (
      !force &&
      lastFetched.current &&
      now - lastFetched.current < cacheTimeout &&
      data.length > 0
    ) {
      console.log(`Using cached ${type} data`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/${endpoint}`, {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("thriveAuth") || ""}`,
        },
      });

      let updatedData: T[] = response.data;

      if (type === "team") {
        updatedData = response.data.map((item: TeamMember) => ({
          ...item,
          image: item.image ? `${API_URL}/storage/${item.image}` : "",
        }));
      }

      setData(updatedData);
      lastFetched.current = now;
      setRetryCount(0);

      if (type === "services") {
        updateContentRef.current({
          ...contentDataRef.current,
          services: updatedData as Service[],
        });
      } else if (type === "team") {
        updateContentRef.current({
          ...contentDataRef.current,
          team: updatedData as TeamMember[],
        });
      } else if (type === "abouts") {
        updateContentRef.current({
          ...contentDataRef.current,
          about: updatedData[0] || contentDataRef.current.about,
        });
      }

      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      let errorMessage = `Failed to fetch ${type}: ${err.message}`;
      if (err.response) {
        errorMessage += ` (Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)})`;
      }

      if (err.response?.status === 429 && retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 100;
        console.log(`Rate limit hit for ${type}. Retrying in ${delay / 1000}s`);
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchData(true);
        }, delay);
      } else {
        setError(errorMessage);
      }
    }
  }, [type, retryCount, data.length]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, fetchData, retry };
};
