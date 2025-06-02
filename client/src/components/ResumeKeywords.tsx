export const ResumeKeywords = ({ keywords }: { keywords: string[] }) => (
  <section>
    <h2 className="text-xl font-semibold mb-2">Common Resume Keywords</h2>
    <div className="bg-gray-800 rounded-xl p-4 shadow">
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span
            key={k}
            className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold capitalize"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  </section>
);
