import InterviewGenerator from './components/InterviewGenerator';

function App() {
  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header / Branding */}
        <header className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold tracking-wide">
            PyData<span className="text-red-500">PRO</span>
          </h1>

        </header>

        {/* Main Generator Section */}
        <InterviewGenerator />
      </div>
    </main>
  );
}

export default App;
