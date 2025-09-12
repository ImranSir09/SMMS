import React from 'react';

interface DoughnutChartProps {
  data: { label: string; value: number }[];
}

const COLORS = [
  '#4f46e5', '#f97316', '#16a34a', '#3b82f6',
  '#ef4444', '#eab308', '#8b5cf6', '#06b6d4',
  '#d946ef', '#ec4899',
];

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-foreground/60">No data to display</p>;

  let cumulative = 0;
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const startAngle = (cumulative / total) * 360;
    const endAngle = ((cumulative + item.value) / total) * 360;
    cumulative += item.value;

    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
    const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
    const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
    const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

    const d = `M ${x1},${y1} A 40,40 0 ${largeArcFlag},1 ${x2},${y2}`;
    
    return {
      path: d,
      color: COLORS[index % COLORS.length],
      label: item.label,
      value: item.value,
      percentage: (percentage * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full h-full gap-8">
      <div className="relative w-56 h-56">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => (
             <path
                key={index}
                d={segment.path}
                stroke={segment.color}
                strokeWidth="12"
                fill="none"
                className="transition-all duration-500"
             />
          ))}
        </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">{total}</span>
            <span className="text-sm text-foreground/70">Total Students</span>
        </div>
      </div>
      <div className="w-full md:w-1/2 max-h-64 overflow-y-auto">
        <ul className="space-y-2 text-sm">
          {segments.map((segment, index) => (
            <li key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }}></span>
                    <span className="font-semibold">{segment.label}</span>
                </div>
              <span className="text-foreground/80">{segment.value} ({segment.percentage}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DoughnutChart;
