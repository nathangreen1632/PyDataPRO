interface Props {
  value: number;
}

const AverageSalaryCard = ({ value }: Props) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center">
      <h3 className="text-xl font-semibold text-white mb-3">Average Salary</h3>
      <p className="text-4xl font-bold text-emerald-500">${value.toLocaleString()}</p>
    </div>
  );
};

export default AverageSalaryCard;
