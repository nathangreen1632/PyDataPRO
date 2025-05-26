import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../utils/api";

interface Resume {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  url: string;
  platform: string;
}

interface LearningResponse {
  courses: Course[];
  skillsExtracted: string[];
}

export const LearningResources = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeContent, setSelectedResumeContent] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loading = dashboardLoading || coursesLoading;

  const hasFetched = useRef(false);

  // Fetch dashboard resumes
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          setError("We couldn't load your resumes. Please try again later.");
          setResumes([]);
          return;
        }

        const data = await res.json();
        setResumes(data.resumes);
        const mostRecent = data.resumes?.[0];
        if (mostRecent) {
          setSelectedResumeId(String(mostRecent.id));
          setSelectedResumeContent(mostRecent.content);
        }
      } catch (err) {
        console.error("Error fetching dashboard resumes:", err);
        setError("Something went wrong while loading your dashboard.");
        setResumes([]);
      } finally {
        setDashboardLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  // Fetch learning resources
  const fetchCourses = async (resumeText: string) => {
    setCoursesLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/learning-resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ resume: resumeText }),
      });

      if (!res.ok) {
        setError("Failed to fetch learning resources. Please try again later.");
        setCourses([]);
        setSkills([]);
        return;
      }

      const data: LearningResponse = await res.json();
      setCourses(data.courses ?? []);
      setSkills(data.skillsExtracted ?? []);
    } catch (err) {
      console.error("Error fetching learning resources:", err);
      setError("Unable to load learning resources. Please try again.");
    } finally {
      setCoursesLoading(false);
    }
  };

  // Initial course fetch
  useEffect(() => {
    if (!selectedResumeContent || hasFetched.current) return;
    hasFetched.current = true;
    void fetchCourses(selectedResumeContent);
  }, [selectedResumeContent]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenId = e.target.value;
    const selected = resumes.find((r) => String(r.id) === chosenId);

    if (selected) {
      setSelectedResumeId(chosenId);
      setSelectedResumeContent(selected.content);
      setCourses([]);
      setSkills([]);
      setError(null);
      setCoursesLoading(true);
      hasFetched.current = false;
    }
  };

  const handleRefresh = () => {
    if (!selectedResumeContent) return;
    hasFetched.current = true;
    void fetchCourses(selectedResumeContent);
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Recommended Learning Resources</h1>

      {resumes.length > 1 && (
        <div className="mb-4">
          <label
            htmlFor="resume-select"
            className="block text-lg font-medium text-gray-300 mb-1"
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

      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl text-center font-semibold mb-2">Skills Extracted</h2>
          <div className="flex flex-wrap gap-2 w-1/2 mx-auto justify-center">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading learning resources...</span>
        </div>
      )}

      {error && <p className="text-red-500 text-center py-8">{error}</p>}

      {!loading && !error && (
        <>
          {/* Refresh Button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {/* No results fallback */}
          {courses.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No learning resources found for this resume.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-gray-800 text-white p-4 rounded-lg shadow-md"
                >
                  <h1 className="text-xl text-sky-400 font-semibold">{course.title}</h1>
                  <div className="mt-6">
                    <p className="text-sm text-gray-300 mb-2">{course.description}</p>
                  </div>
                  <div className="mb-6"></div>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-600"
                  >
                    View Course on {course.platform}
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
