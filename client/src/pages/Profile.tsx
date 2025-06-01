import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";
import { CareerSuggestionsCard } from "../components/CareerSuggestionsCard.tsx";
import { CVitaeResumes } from "../components/CVitaeResumes";
import { ResumeKeywords } from "../components/ResumeKeywords";
import { CareerGistSearches } from "../components/CareerGistSearches";
import { AppliedJobs } from "../components/AppliedJobs";
import { FavoriteKeywords } from "../components/FavoriteKeywords";
import { FavoriteJobs } from "../components/FavoriteJobs";

interface Resume {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface DashboardData {
  userName: string;
  resumes: Resume[];
  keywords: string[];
  resumeKeywords: string[];
}

export const Profile = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeContent, setSelectedResumeContent] = useState<string>("");
  const [loadingWidget, setLoadingWidget] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError(`Failed to load dashboard (status: ${res.status})`);
          setData(null);
          return;
        }
        const dashboard = await res.json();
        setData({
          userName: dashboard.userName,
          resumes: dashboard.resumes,
          keywords: dashboard.keywords,
          resumeKeywords: dashboard.resumeKeywords,
        });

        if (dashboard.resumes?.length) {
          setSelectedResumeId(String(dashboard.resumes[0].id));
          setSelectedResumeContent(dashboard.resumes[0].content);
        }
      } catch (err: unknown) {
        console.error("🚨 Dashboard error:", err instanceof Error ? err.message : err);
        setError("Unable to load dashboard. Please try again later.");
        setData(null);
      }
    };
    void fetchDashboard();
  }, [token]);

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

  if (error) return <p className="text-red-400 p-4">{error}</p>;
  if (!data) return <p className="text-white p-4">Loading dashboard...</p>;

  return (
    <div className="max-w-5xl w-full mx-auto text-white px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold text-center">
        <span className="text-sky-400">Welcome,</span>
        <span className="text-emerald-300"> {data.userName}!</span>
      </h1>

      <CVitaeResumes resumes={data.resumes} />
      <ResumeKeywords keywords={data.resumeKeywords} />
      <CareerGistSearches token={token!} />
      <AppliedJobs />
      <FavoriteKeywords />
      <FavoriteJobs />

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
                className="bg-gray-800 text-gray-300 p-3 rounded w-full sm:w-auto appearance-auto"
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
              Generating personalized suggestions...
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
