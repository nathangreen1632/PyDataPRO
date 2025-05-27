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
      <h1 className="text-3xl font-bold"><span className="text-sky-400">Welcome,</span>
        <span className="text-emerald-300"> {data.userName}!</span></h1>

      {/* Resumes Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Resumes</h2>
        <div className="flex flex-wrap gap-2 ml-6">
          {data.resumes.map((r) => (
            <span
              key={r.id}
              className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              {r.title} — {new Date(r.created_at).toLocaleDateString()}
            </span>
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Favorited Jobs</h2>
        <div className="grid grid-cols-2 gap-x-4 ml-6">
          <div className="space-y-2">
            {data.favorites.slice(0, 5).map((f) => (
              <span
                key={`col1-${f.id}`}
                className="block bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold"
              >
                {f.title} at {f.company}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {data.favorites.slice(5, 10).map((f) => (
              <span
                key={`col2-${f.id}`}
                className="block bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold"
              >
                {f.title} at {f.company}
              </span>
            ))}
          </div>
        </div>
      </section>


      <section>
        <h2 className="text-xl font-semibold mb-2">Common Resume Keywords</h2>
        <div className="flex flex-wrap gap-2 ml-6">
          {data.keywords.map((k) => (
            <span key={k} className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
              {k}
            </span>
          ))}
        </div>
      </section>

      {/* Search Terms Section */}
      <section>
        <a
          href="https://www.careergistpro.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-fit hover:underline decoration-red-500 focus:outline-none"
          aria-label="Visit CareerGistPRO"
        >
          <h2 className="text-xl font-semibold mb-2">
            <span className="text-white">Recent CareerGist</span>
            <span className="text-red-500">PRO</span>
            <span className="text-white"> Searches</span>
          </h2>
        </a>
        <div className="flex flex-wrap gap-2 ml-6">
          {data.searchTerms.map((term, l) => (
            <span
              key={l}
              className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-2"
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
                className="block text-lg font-bold text-white mb-1"
              >
                Choose Resume to Analyze:
              </label>
              <select
                id="resume-selector"
                value={selectedResumeId}
                onChange={handleResumeChange}
                className="bg-gray-800 text-gray-300 p-2 rounded w-full"
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
