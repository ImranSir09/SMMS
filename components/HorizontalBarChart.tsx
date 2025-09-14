
import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: ChartData[];
}

const COLORS = [
  'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500', 'bg-teal-500',
  'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-amber-500',
  'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-purple-500',
];

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);

  if (data.length === 0) {
      return (
          <p className="text-foreground/60 text-xs text-center py-8">
              No student data for chart.
          </p>
      );
  }

  return (
    <div className="w-full space-y-2 py-2">
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2 text-xs animate-fade-in-item" style={{ animationDelay: `${index * 50}ms` }}>
          <div className="w-16 text-right truncate font-semibold text-foreground/80">{item.label}</div>
          <div className="flex-1 bg-background rounded-full h-4 overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${COLORS[index % COLORS.length]}`}
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="w-8 text-left font-bold">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalBarChart;
