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
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<
    { term: string; index: number }[]
  >([]);

  const {
    data: searchTerms = [],
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["searchTerms", token],
    queryFn: async () => {
      if (!token) {
        toast.error("Authentication required to load searches.");
        return [];
      }
      try {
        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          toast.error(`Search terms fetch failed: ${res.status}`);
          return [];
        }
        const json = await res.json();
        return json.searchTerms ?? [];
      } catch (err) {
        console.error("Error fetching search terms:", err);
        toast.error("An unexpected error occurred loading searches.");
        return [];
      }
    },
    refetchInterval: 5000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const termsWithIndex = searchTerms.map((term, index) => ({ term, index }));

  const visibleSearchTerms = termsWithIndex.filter(
    (item) =>
      !optimisticallyDeleted.some(
        (del) => del.term === item.term && del.index === item.index
      )
  );

  useEffect(() => {
    setOptimisticallyDeleted((prev) =>
      prev.filter((del) =>
        searchTerms[del.index] === del.term
      )
    );
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
            const terms = visibleSearchTerms.slice(start, end);
            const colKey = terms[0]
              ? `col-${terms[0].term}-${terms[0].index}`
              : `col-empty-${colIndex}`;
            return (
              <div key={colKey} className="space-y-2">
                {terms.map(({ term, index }) => (
                  <span
                    key={`term-${index}-${term}`}
                    className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold flex justify-between items-center"
                  >
                    <span>{term}</span>
                    <button
                      onClick={async (): Promise<void> => {
                        const id = { term, index };
                        setOptimisticallyDeleted((prev) => [...prev, id]);
                        try {
                          const res = await fetch(
                            `${API_BASE}/analytics/search-history/${encodeURIComponent(term)}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (res.ok) {
                            toast.success(`Deleted "${term}"`);
                            onTermDeleted?.(term, index);
                          } else {
                            toast.error("Failed to delete term.");
                            setOptimisticallyDeleted((prev) =>
                              prev.filter(
                                (d) =>
                                  d.term !== term || d.index !== index
                              )
                            );
                          }
                        } catch (err) {
                          console.error("Error deleting term:", err);
                          toast.error("An error occurred while deleting.");
                          setOptimisticallyDeleted((prev) =>
                            prev.filter(
                              (d) =>
                                d.term !== term || d.index !== index
                            )
                          );
                        }
                      }}
                      className="ml-2 text-white hover:text-red-300"
                      aria-label={`Delete ${term}`}
                    >
                      ❌
                    </button>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
