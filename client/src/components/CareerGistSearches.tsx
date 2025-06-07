import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSearchTerms } from "../helpers/fetchSearchTerms";
import toast from "react-hot-toast";
import { API_BASE } from "../utils/api";

interface CareerGistSearchesProps {
  token: string;
  onTermDeleted?: (term: string, index: number) => void;
}

interface SearchTerm {
  term: string;
  index: number;
}

export const CareerGistSearches = ({
  token,
  onTermDeleted,
}: CareerGistSearchesProps) => {
  const [optimisticallyDeleted, setOptimisticallyDeleted] = useState<
    SearchTerm[]
  >([]);

  const {
    data: searchTerms = [],
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["searchTerms", token],
    queryFn: () => fetchSearchTerms(token),
    refetchInterval: 5000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const termsWithIndex: SearchTerm[] = useMemo(
    () => searchTerms.map((t, i) => ({ term: t, index: i })),
    [searchTerms]
  );

  const visibleSearchTerms = useMemo(
    () =>
      termsWithIndex.filter(
        (item) =>
          !optimisticallyDeleted.some(
            (del) => del.term === item.term && del.index === item.index
          )
      ),
    [termsWithIndex, optimisticallyDeleted]
  );

  const columns = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, colIndex) => {
        const start = colIndex * 5;
        const slice = visibleSearchTerms.slice(start, start + 5);
        const key = slice[0]
          ? `col-${slice[0].term}-${slice[0].index}`
          : `col-empty-${colIndex}`;
        return { key, items: slice };
      }),
    [visibleSearchTerms]
  );

  useEffect(() => {
    setOptimisticallyDeleted((prev) =>
      prev.filter((del) => searchTerms[del.index] === del.term)
    );
  }, [searchTerms]);

  const handleDelete = useCallback(
    async (term: string, index: number) => {
      const id = { term, index };
      setOptimisticallyDeleted((prev) => [...prev, id]);

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
        // handle non-2xx status without throwing
        console.error("Delete failed with status:", res.status);
        toast.error("Failed to delete term.");
        setOptimisticallyDeleted((prev) =>
          prev.filter((d) => d.term !== term || d.index !== index)
        );
      }
    },
    [token, onTermDeleted]
  );

  if (isLoading) {
    return <p className="text-gray-300 p-4">Loading searches...</p>;
  }

  if (error) {
    return <p className="text-red-400 p-4">Failed to load searches.</p>;
  }

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
          {columns.map(({ key, items }) => (
            <div key={key} className="space-y-2">
              {items.map(({ term, index }) => (
                <SearchTermPill
                  key={`${term}-${index}`}
                  term={term}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface SearchTermPillProps {
  term: string;
  index: number;
  onDelete: (term: string, index: number) => void;
}
const SearchTermPill = ({
  term,
  index,
  onDelete,
}: SearchTermPillProps) => (
  <span className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold flex justify-between items-center">
    <span>{term}</span>
    <button
      onClick={() => onDelete(term, index)}
      className="ml-2 text-white hover:text-red-300"
      aria-label={`Delete ${term}`}
    >
      ❌
    </button>
  </span>
);

