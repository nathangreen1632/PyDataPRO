import React, { useState } from 'react';
import { API_BASE } from '../utils/api';


const InterviewGenerator = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch(`${API_BASE}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: jobTitle }),
      });

      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center">Interview Question Generator</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4"
        >
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter a job title (e.g. Frontend Developer)"
            className="w-full p-3 bg-gray-700 text-white text-center placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="block w-full sm:w-72 mx-auto mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-full transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        {questions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-center mb-4">Interview Questions</h2>
            <ul className="space-y-3 list-disc list-inside text-gray-300">
              {questions.map((q, idx) => (
                <li key={idx} className="text-base">{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewGenerator;
