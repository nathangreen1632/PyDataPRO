import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  locations: Record<string, number>; // 👈 fixed type
}

const TopLocationsBarChart = ({ locations }: Props) => {
  const data = Object.entries(locations).map(([name, count]) => ({
    location: name, // 👈 used in XAxis
    count,
  }));

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">
        Top Locations
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="location" tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#D1D5DB', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              color: '#E5E7EB',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopLocationsBarChart;
