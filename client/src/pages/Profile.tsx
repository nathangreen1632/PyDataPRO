import { useEffect, useState } from "react";

interface Resume {
  id: number;
  title: string;
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

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        // ✅ Instead of throwing, return a default fallback
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


  if (!data) return <p className="text-white p-4">Loading dashboard...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 text-white space-y-8">
      <h1 className="text-3xl font-bold">Welcome, {data.userName}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">📄 Your Resumes</h2>
        <ul className="space-y-1">
          {Array.isArray(data?.resumes) ? (
            data.resumes.map((r) => (
              <li key={r.id} className="bg-gray-800 p-3 rounded">
                {r.title} — {new Date(r.created_at).toLocaleDateString()}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No resumes found.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">⭐ Favorite Jobs</h2>
        <ul className="space-y-1">
          {Array.isArray(data?.favorites) ? (
            data.favorites.map((f) => (
              <li key={f.id} className="bg-gray-800 p-3 rounded">
                {f.title} at {f.company}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No favorite jobs found.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">🔑 Common Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(data?.keywords) ? (
            data.keywords.map((k) => (
              <span key={k} className="bg-emerald-600 px-3 py-1 rounded-full text-sm">
                {k}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No keywords detected.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">🔎 Recent Searches</h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(data?.searchTerms) && data.searchTerms.length > 0 ? (
            data.searchTerms.map((term, l) => (
              <span
                key={l}
                className="bg-purple-700 text-white px-3 py-1 rounded-full text-sm"
              >
                {term}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic">No recent searches found.</p>
          )}
        </div>
      </section>
    </div>
  );
};
