import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API_BASE } from "../utils/api";

export const CareerGistSearches = ({
  token,
  onTermDeleted,
}: {
  token: string;
  onTermDeleted?: (term: string, index: number) => void;
}) => {
  const [localSearchTerms, setLocalSearchTerms] = useState<string[]>([]);

  const {
    data: searchTerms = [],
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["searchTerms", token],
    queryFn: async () => {
      if (!token) throw new Error("No token found");
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Search terms fetch failed: ${res.status}`);
      const json = await res.json();
      return json.searchTerms ?? [];
    },
    refetchInterval: 5000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    setLocalSearchTerms(searchTerms);
  }, [searchTerms]);

  if (isLoading) return <p className="text-gray-300 p-4">Loading searches...</p>;
  if (error) return <p className="text-red-400 p-4">Failed to load searches.</p>;

  return (
    <section>
      <a
        href="https://www.careergistpro.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-fit hover:underline decoration-red-500 focus:outline-none"
      >
        <h2 className="text-xl font-semibold mb-2">
          <span className="text-white">Recent CareerGist</span>
          <span className="text-red-500">PRO</span>
          <span className="text-white"> Searches</span>
        </h2>
      </a>
      <div className="bg-gray-800 rounded-xl p-4 shadow">
        <div className="grid grid-cols-3 gap-x-4">
          {Array.from({ length: 3 }).map((_, colIndex) => {
            const start = colIndex * 5;
            const end = start + 5;
            const terms = localSearchTerms.slice(start, end);
            const colKey = terms[0] ? `col-${terms[0]}` : `col-empty-${colIndex}`;
            return (
              <div key={colKey} className="space-y-2">
                {terms.map((term, localIndex) => {
                  const globalIndex = start + localIndex;
                  return (
                    <span
                      key={`term-${globalIndex}`}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold flex justify-between items-center"
                    >
                      <span>{term}</span>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `${API_BASE}/analytics/search-history/${encodeURIComponent(term)}`,
                              {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }
                            );
                            if (res.ok) {
                              setLocalSearchTerms((prev) =>
                                prev.filter((_, i) => i !== globalIndex)
                              );
                              toast.success(`Deleted "${term}"`);
                              onTermDeleted?.(term, globalIndex);
                            } else {
                              toast.error("Failed to delete term.");
                            }
                          } catch (err) {
                            console.error("Error deleting term:", err);
                            toast.error("An error occurred while deleting.");
                          }
                        }}
                        className="ml-2 text-white hover:text-red-300"
                        aria-label={`Delete ${term}`}
                      >
                        ❌
                      </button>
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
