import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "../utils/api";

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

export const AppliedJobs = () => {
  const token = localStorage.getItem("token");

  const {
    data: appliedJobs,
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["appliedJobs", token],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await fetch(`${API_BASE}/analytics/applied-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return await res.json();
    },
    refetchInterval: 20000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <p className="text-gray-300 p-4">Loading applied jobs...</p>;
  if (error) return <p className="text-red-400 p-4">Failed to load applied jobs.</p>;

  return (
  <section>
    <h2 className="text-xl font-semibold mb-2">Applied Jobs</h2>
      <div className="bg-gray-800 rounded-xl p-4 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div className="space-y-2">
            {appliedJobs?.slice(0, 10).map((title) => (
              <span
                key={`col1-${title}`}
                className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold"
                title={title}
              >
                <span className="flex-1 min-w-0 truncate">
                  {truncate(title, 32)}
                </span>

                <span className="ml-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                  Applied
                </span>
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {appliedJobs?.slice(5, 10).map((title) => (
              <span
                key={`col2-${title}`}
                className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold"
                title={title}
              >
                <span className="flex-1 min-w-0 truncate">
                  {truncate(title, 32)}
                </span>
                <span className="ml-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                  Applied
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
