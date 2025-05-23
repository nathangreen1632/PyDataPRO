import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/api";

interface CareerSuggestionsCardProps {
  resume: string;
  userId: string;
}

interface Suggestion {
  role: string;
  explanation: string;
}

interface CareerSuggestionsResponse {
  skillsExtracted: string[];
  suggestedRoles: Suggestion[];
}

export const CareerSuggestionsCard = ({
  resume,
  userId,
}: CareerSuggestionsCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<CareerSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/career-suggestions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume, userId }),
        });

        if (!res.ok) {
          console.warn(`⚠️ Suggestion fetch failed: ${res.status}`);
          setData(null);
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("🚨 Fetch error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchSuggestions();
  }, [resume, userId]);

  if (loading) {
    return <p className="text-sm text-gray-400 italic">Loading suggestions...</p>;
  }

  if (!data || !data.suggestedRoles?.length) {
    return <p className="text-sm text-gray-400 italic">No suggestions available.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow">
      <h2 className="text-xl font-semibold mb-2">🧭 Career Suggestions</h2>

      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-emerald-600 px-4 py-2 rounded text-sm hover:bg-emerald-700 transition"
      >
        {expanded ? "Hide Suggestions" : "Show Suggestions"}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Top Roles:</h3>
            <ul className="space-y-2">
              {data.suggestedRoles.slice(0, 3).map((r, i) => (
                <li key={i} className="bg-gray-700 p-3 rounded">
                  <p className="font-bold text-lg">{r.role}</p>
                  <p className="text-sm text-gray-300">{r.explanation}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Extracted Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {data.skillsExtracted.map((s) => (
                <span
                  key={s}
                  className="bg-blue-700 text-white px-3 py-1 rounded-full text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <button
            className="text-emerald-400 underline text-sm"
            onClick={() => navigate("/career-path")}
          >
            View full career path →
          </button>
        </div>
      )}
    </div>
  );
};
