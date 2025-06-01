interface Resume {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export const CVitaeResumes = ({ resumes }: { resumes: Resume[] }) => (
  <section>
    <a
      href="https://www.cvitaepro.com"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-fit hover:underline decoration-red-500 focus:outline-none"
    >
      <h2 className="text-xl font-semibold mb-4">
        <span className="text-white font-semibold">Recent CVitae</span>
        <span className="text-red-500">PRO</span>
        <span className="text-white"> Resumes</span>
      </h2>
    </a>
    <div className="bg-gray-800 rounded-xl p-4 shadow">
      {resumes.length >= 6 ? (
        <div className="grid grid-cols-3 gap-x-6 gap-y-3">
          {Array.from({ length: 3 }).map((_, colIndex) => {
            const start = colIndex * 5;
            const end = start + 5;
            const group = resumes.slice(start, end);
            return (
              <div key={`col-${group[0]?.id ?? colIndex}`} className="space-y-2">
                {group.map((r) => (
                  <span
                    key={r.id}
                    className="block bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold capitalize"
                  >
                    {r.title} — {new Date(r.created_at).toLocaleDateString()}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {resumes.map((r) => (
            <span
              key={r.id}
              className="bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold capitalize"
            >
              {r.title} — {new Date(r.created_at).toLocaleDateString()}
            </span>
          ))}
        </div>
      )}
    </div>
  </section>
);
