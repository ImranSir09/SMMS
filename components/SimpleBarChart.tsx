
import React from 'react';

interface ChartData {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
}

const COLORS = ['#3b82f6', '#f97316', '#808080']; // Blue, Orange, Gray

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  const barWidth = 40;
  const barSpacing = 20;
  const chartWidth = data.length * (barWidth + barSpacing);
  const chartHeight = 100;
  const labelHeight = 20;

  return (
    <div className="border border-gray-400 p-1 w-full h-full flex flex-col">
      <h3 className="text-center font-semibold text-xs">{title}</h3>
      <div className="flex-grow flex items-end justify-center gap-4 px-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center">
            <span className="text-xs font-bold">{item.value}</span>
            <div
              className="w-8 rounded-t"
              style={{
                height: `${(item.value / maxValue) * (chartHeight - labelHeight)}px`,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            ></div>
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </div>
       <div className="flex justify-center items-center space-x-2 mt-1 border-t border-gray-300 pt-1">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-1 text-[8px]">
            <div className="w-2 h-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleBarChart;
