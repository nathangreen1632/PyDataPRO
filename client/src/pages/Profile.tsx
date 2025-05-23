import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { CareerSuggestionsCard } from "../components/CareerSuggestionsCard.tsx";
import toast from "react-hot-toast";

interface Resume {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Favorite {
  id: number;
  title: string;
  company: string;
}

interface DashboardData {
  userName: string;
  resumes: Resume[];
  favorites: Favorite[];
  keywords: string[];
  searchTerms: string[];
}

export const Profile = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeContent, setSelectedResumeContent] = useState<string>("");
  const [loadingWidget, setLoadingWidget] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          console.warn(`⚠️ Dashboard fetch failed: ${res.status}`);
          setData({
            userName: "Unauthorized",
            resumes: [],
            favorites: [],
            keywords: [],
            searchTerms: [],
          });
          return;
        }

        const json = await res.json();
        setData(json);

        const mostRecent = json.resumes?.[0];
        if (mostRecent) {
          setSelectedResumeId(String(mostRecent.id));
          setSelectedResumeContent(mostRecent.content);
        }
      } catch (err) {
        console.error("🚨 Dashboard error:", err);
        setData({
          userName: "Error",
          resumes: [],
          favorites: [],
          keywords: [],
          searchTerms: [],
        });
      }
    };

    void fetchDashboard();
  }, []);

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenId = e.target.value;
    const selected = data?.resumes.find((r) => String(r.id) === chosenId);

    if (selected) {
      setSelectedResumeId(chosenId);
      setLoadingWidget(true);
      setSelectedResumeContent("");

      setTimeout(() => {
        setSelectedResumeContent(selected.content);
        setLoadingWidget(false);
      }, 50);
    }
  };

  if (!data) return <p className="text-white p-4">Loading dashboard...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 text-white space-y-8">
      <h1 className="text-3xl font-bold">Welcome, {data.userName}</h1>

      {/* Resumes Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">📄 Your Resumes</h2>
        <ul className="space-y-1">
          {data.resumes.map((r) => (
            <li key={r.id} className="bg-gray-800 p-3 rounded">
              {r.title} — {new Date(r.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>

      {/* Favorites Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">⭐ Favorite Jobs</h2>
        <ul className="space-y-1">
          {data.favorites.map((f) => (
            <li key={f.id} className="bg-gray-800 p-3 rounded">
              {f.title} at {f.company}
            </li>
          ))}
        </ul>
      </section>

      {/* Keywords Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🔑 Common Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {data.keywords.map((k) => (
            <span key={k} className="bg-blue-700 px-3 py-1 rounded-full text-sm">
              {k}
            </span>
          ))}
        </div>
      </section>

      {/* Search Terms Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🔎 Recent Searches</h2>
        <div className="flex flex-wrap gap-2">
          {data.searchTerms.map((term, l) => (
            <span
              key={l}
              className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{term}</span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `${API_BASE}/analytics/search-history/${encodeURIComponent(term)}`,
                      {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      }
                    );

                    if (res.ok) {
                      toast.success(`Deleted "${term}"`);
                      setData((prev) =>
                        prev
                          ? {
                              ...prev,
                              searchTerms: prev.searchTerms.filter((t) => t !== term),
                            }
                          : prev
                      );
                    } else {
                      toast.error("Failed to delete term.");
                    }
                  } catch (err) {
                    console.error("❌ Failed to delete search term:", err);
                    toast.error("An error occurred while deleting.");
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
      </section>

      {/* Career Suggestions Widget */}
      {data.resumes.length > 0 && localStorage.getItem("userId") && (
        <section>
          {data.resumes.length > 1 && (
            <div className="mb-4">
              <label
                htmlFor="resume-selector"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Choose Resume to Analyze:
              </label>
              <select
                id="resume-selector"
                value={selectedResumeId}
                onChange={handleResumeChange}
                className="bg-gray-700 text-white p-2 rounded w-full"
              >
                {data.resumes.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.title} — {new Date(r.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loadingWidget ? (
            <div className="bg-gray-800 p-4 rounded text-sm text-gray-300 animate-pulse">
              🧠 Generating personalized suggestions...
            </div>
          ) : (
            selectedResumeContent && (
              <CareerSuggestionsCard
                resume={selectedResumeContent}
                userId={localStorage.getItem("userId")!}
              />
            )
          )}
        </section>
      )}
    </div>
  );
};
