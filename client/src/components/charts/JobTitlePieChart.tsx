import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Job {
  title: string;
}

interface Props {
  titles: Record<string, number>;
  jobs: Job[];
}

const COLORS = [
  '#34D399', '#60A5FA', '#FBBF24', '#F87171', '#A78BFA', '#10B981', '#F472B6'
];

const JobTitlePieChart = ({ jobs, titles }: Props) => {
  // Count how many times each job title appears
  const counts: Record<string, number> = {};

  jobs.forEach((job) => {
    const title = job.title.trim();
    counts[title] = (counts[title] || 0) + 1;
  });

  const data = Object.entries(titles).map(([title, count]) => ({
    name: title,
    value: count,
  }));

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">
        Job Title Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name }) => name}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#374151',
              color: '#E5E7EB',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobTitlePieChart;
