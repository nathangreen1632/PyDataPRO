import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../utils/api";

interface Favorite {
  id: number;
  title: string;
  company: string;
}

export const FavoriteJobs = () => {
  const token = localStorage.getItem("token");

  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery<Favorite[]>({
    queryKey: ["favorites", token],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Favorites fetch failed: ${res.status}`);
      const json = await res.json();
      return json.favorites ?? [];
    },
    refetchInterval: 10000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <p className="text-gray-300 p-4">Loading favorites...</p>;
  if (error) return <p className="text-red-400 p-4">Failed to load favorites.</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Favorited Jobs</h2>
      <div className="bg-gray-800 rounded-xl p-4 shadow">
        <div className="grid grid-cols-2 gap-x-4">
          <div className="space-y-2">
            {favorites?.slice(0, 5).map((f) => (
              <span
                key={`col1-${f.id}`}
                className="block bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold truncate max-w-full"
                title={`${f.title} at ${f.company}`}
              >
                {f.title} at {f.company}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {favorites?.slice(5, 10).map((f) => (
              <span
                key={`col2-${f.id}`}
                className="block bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold truncate max-w-full"
                title={`${f.title} at ${f.company}`}
              >
                {f.title} at {f.company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
