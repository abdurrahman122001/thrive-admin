import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { ContentData, About, Service, TeamMember } from "../../types";

// Interface for fetch result
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
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  const lastFetched = useRef<number | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Use VITE_API_URL with fallback for development
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://thriveenterprisesolutions.com.au/admin";

  // Debounce function to prevent rapid calls
  const debounce = (callback: () => void, delay: number) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(callback, delay);
  };

  const fetchData = useCallback(
    async (force: boolean = false) => {
      const endpoint =
        type === "services"
          ? "services"
          : type === "team"
          ? "teams/list"
          : "abouts";

      // Check cache
      const now = Date.now();
      if (
        !force &&
        lastFetched.current &&
        now - lastFetched.current < cacheTimeout &&
        data.length > 0
      ) {
        console.log(
          `Using cached ${type} data (last fetched: ${new Date(
            lastFetched.current
          ).toISOString()})`
        );
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

        // Handle image URLs for team and abouts
        if (type === "team" || type === "abouts") {
          updatedData = response.data.map((item: About | TeamMember) => {
            const imageUrl = item.image
              ? `${API_URL}/storage/${item.image}`
              : "";
            console.log(
              `Constructed image URL for ${type} - ${
                item.name || item.id
              }: ${imageUrl}`
            );
            return {
              ...item,
              image: imageUrl,
            };
          });
        }

        setData(updatedData);
        setLoading(false);
        setRetryCount(0); // Reset retry count on success
        lastFetched.current = now; // Update cache timestamp

        // Update contentData based on type
        if (type === "services") {
          updateContent({ ...contentData, services: updatedData as Service[] });
        } else if (type === "team") {
          updateContent({ ...contentData, team: updatedData as TeamMember[] });
        } else if (type === "abouts") {
          updateContent({
            ...contentData,
            about: updatedData[0] || contentData.about,
          });
        }
      } catch (err: any) {
        setLoading(false);
        let errorMessage = `Failed to fetch ${type}: ${err.message}`;
        if (err.response) {
          errorMessage += ` (Status: ${
            err.response.status
          }, Data: ${JSON.stringify(err.response.data)})`;
        }

        if (err.response?.status === 429 && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 100; // Exponential backoff with jitter
          console.log(
            `Rate limit hit for ${type}. Retrying in ${
              delay / 1000
            } seconds... (Attempt ${retryCount + 1}/${maxRetries})`
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchData(true); // Force retry
          }, delay);
        } else {
          setError(errorMessage);
          console.error(`Error fetching ${type}:`, err);
        }
      }
    },
    [type, retryCount, contentData, updateContent, data.length]
  );

  // Debounced fetchData
  const debouncedFetchData = useCallback(
    (force: boolean = false) => {
      debounce(() => fetchData(force), 300);
    },
    [fetchData]
  );

  // Manual retry function
  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchData(true); // Force fetch
  }, [fetchData]);

  return { data, loading, error, fetchData: debouncedFetchData, retry };
};
