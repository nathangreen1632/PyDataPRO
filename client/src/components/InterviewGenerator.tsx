import React, { useState } from 'react';

const InterviewGenerator = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);

    try {
      const res = await fetch('/generate-questions', {
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
    <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-800 border-2 border-gray-900 text-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter a job title (e.g. Frontend Developer)"
            className="w-full p-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="w-full bg-emerald-500 text-black font-medium py-3 px-4 rounded-lg hover:bg-emerald-700 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </form>

        {questions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white text-center mb-2">Generated Questions</h2>
            <ul className="space-y-3 list-disc list-inside text-gray-300">
              {questions.map((q, idx) => (
                <li key={idx} className="text-base">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewGenerator;
