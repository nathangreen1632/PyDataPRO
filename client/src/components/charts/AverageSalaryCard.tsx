interface Props {
  value: number;
}

const AverageSalaryCard = ({ value }: Props) => {
  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col text-center">
      <h2
        className="text-xl font-semibold text-white mb-3"
        aria-label="Average Salary"
      >
        Average Salary
      </h2>

      {/* Spacer pushes salary to vertical center */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-4xl font-bold text-emerald-500">
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
};


export default AverageSalaryCard;
