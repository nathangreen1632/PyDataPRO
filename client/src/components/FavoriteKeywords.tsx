import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../utils/api";

export const FavoriteKeywords = () => {
  const token = localStorage.getItem("token");

  const {
    data: keywords = [],
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["favoriteKeywords", token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.keywords ?? [];
    },
    refetchInterval: 45000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <p className="text-gray-300 p-4">Loading favorite keywords...</p>;
  if (error) return <p className="text-red-400 p-4">Failed to load favorite keywords.</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Common Favorited Keywords</h2>
      <div className="bg-gray-800 rounded-xl p-4 shadow">
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span
              key={k}
              className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold capitalize"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
