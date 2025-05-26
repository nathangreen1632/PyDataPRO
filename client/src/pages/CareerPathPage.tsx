import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";

interface CareerSuggestion {
  role: string;
  explanation: string;
}

interface CareerData {
  skillsExtracted: string[];
  suggestedRoles: CareerSuggestion[];
}

interface Resume {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const CareerPathPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async (resume: string, userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/career-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, userId }),
      });

      if (!res.ok) {
        console.error("Suggestion fetch failed:", res.status);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error("Error generating suggestions:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.warn("Missing token or userId.");
          setLoading(false);
          return;
        }

        const dashboardRes = await fetch(`${API_BASE}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dashboardData = await dashboardRes.json();
        const fetchedResumes = dashboardData?.resumes ?? [];

        if (!fetchedResumes.length) {
          console.warn("No resumes found.");
          setLoading(false);
          return;
        }

        setResumes(fetchedResumes);
        setSelectedResumeId(String(fetchedResumes[0].id));
      } catch (err) {
        console.error("Error loading resumes:", err);
      }
    };

    void fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchCareerData = async () => {
      const userId = localStorage.getItem("userId");
      const selectedResume = resumes.find((r) => String(r.id) === selectedResumeId);

      if (userId && selectedResume) {
        setLoading(true);
        const suggestions = await fetchSuggestions(selectedResume.content, userId);
        setData(suggestions);
        setLoading(false);
      }
    };

    if (selectedResumeId) {
      void fetchCareerData();
    }
  }, [selectedResumeId, resumes]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResumeId(e.target.value);
  };

  if (loading) {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-300">Loading career suggestions...</span>
    </div>
  );
}

  if (!data || !Array.isArray(data.skillsExtracted) || !Array.isArray(data.suggestedRoles)) {
    return <p className="text-white p-6">No data available or invalid format.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-6">
      <h1 className="text-3xl font-bold">🧠 Career Path Insights</h1>

      {resumes.length > 1 && (
        <div>
          <label
            htmlFor="resume-select"
            className="block text-xl font-medium text-white mb-1"
          >
            Choose Resume to Analyze:
          </label>
          <select
            id="resume-select"
            value={selectedResumeId}
            onChange={handleResumeChange}
            className="bg-gray-700 text-white p-2 rounded w-full mb-4"
          >
            {resumes.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.title} — {new Date(r.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      )}


      <section>
        <h2 className="text-xl font-semibold mb-2">Skills Extracted</h2>
        <div className="flex flex-wrap gap-2 ml-6">
          {data.skillsExtracted.map((skill, i) => (
            <span
              key={i}
              className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Suggested Roles</h2>
        <ul className="space-y-2">
          {data.suggestedRoles.map((r, idx) => (
            <li key={idx} className="bg-gray-800 p-4 rounded shadow text-white">
              <p className="font-bold text-lg">{r.role}</p>
              <p className="text-sm text-gray-400">{r.explanation}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default CareerPathPage;
