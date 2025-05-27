import { useEffect, useState } from 'react';
import TopLocationsBarChart from '../components/charts/TopLocationsBarChart';
import AverageSalaryCard from '../components/charts/AverageSalaryCard';
import JobTitlePieChart from '../components/charts/JobTitlePieChart';
import { API_BASE } from '../utils/api.ts';

interface Job {
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
}

interface SummaryData {
  average_salary: number;
  top_locations: Record<string, number>;
  common_titles: Record<string, number>;
}

export const ProfileAnalytics = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const jobRes = await fetch(`${API_BASE}/jobs`);
        if (!jobRes.ok) {
          const errorText = await jobRes.text();
          console.error('🔥 Job fetch failed:', errorText);
          return;
        }

        const jobData = await jobRes.json();
        if (!jobData.jobs?.length) {
          console.warn('⚠️ No jobs returned from /jobs endpoint, skipping summary.');
          return;
        }

        setJobs(jobData.jobs);

        const summaryRes = await fetch(`${API_BASE}/analytics/salary-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobs: jobData.jobs }),
        });

        if (!summaryRes.ok) {
          const summaryError = await summaryRes.text();
          console.error('🔥 Salary summary fetch failed:', summaryError);
          return;
        }

        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } catch (err) {
        console.error('💥 Error loading analytics:', err);
      }
    };

    void fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-10 text-center">Analytics Overview</h1>

        {summary ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <TopLocationsBarChart locations={summary.top_locations} />
              <div className="flex items-center justify-center">
                <AverageSalaryCard value={summary.average_salary} />
              </div>
            </div>


            <div className="mt-10">
              <JobTitlePieChart titles={summary.common_titles} jobs={jobs} />
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 text-lg">Loading analytics...</p>
        )}
      </div>
    </div>
  );
};
