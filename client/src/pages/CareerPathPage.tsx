import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api";

interface CareerSuggestion {
  role: string;
  explanation: string;
}

interface CareerData {
  skillsExtracted: string[];
  suggestedRoles: CareerSuggestion[];
}

const CareerPathPage = () => {
  const [data, setData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.warn("Missing token or userId.");
          setLoading(false);
          return;
        }

        const dashboardRes = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dashboardData = await dashboardRes.json();
        const resumeContent = dashboardData?.resumes?.[0]?.content;

        if (!resumeContent) {
          console.warn("No resume content found.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/career-suggestions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume: resumeContent, userId }),
        });

        if (!res.ok) {
          console.error("Suggestion fetch failed:", res.status);
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error loading career path:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) return <p className="text-white p-6">Loading career suggestions...</p>;

  if (!data || !Array.isArray(data.skillsExtracted) || !Array.isArray(data.suggestedRoles)) {
    return <p className="text-white p-6">No data available or invalid format.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 space-y-6">
      <h1 className="text-3xl font-bold">🧠 Career Path Insights</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Skills Extracted</h2>
        <div className="flex flex-wrap gap-2">
          {data.skillsExtracted.map((skill, i) => (
            <span
              key={i}
              className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
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
