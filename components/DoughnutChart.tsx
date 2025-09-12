import React from 'react';

interface DoughnutChartProps {
  data: { label: string; value: number }[];
}

const COLORS = [
  '#4f46e5', '#f97316', '#16a34a', '#3b82f6',
  '#ef4444', '#eab308', '#8b5cf6', '#06b6d4',
];

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <p className="text-foreground/60 text-xs">No data</p>;

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
    };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment, index) => (
             <path key={index} d={segment.path} stroke={segment.color} strokeWidth="15" fill="none" />
          ))}
        </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{total}</span>
            <span className="text-[10px] text-foreground/70">Students</span>
        </div>
      </div>
      <div className="w-full">
        <ul className="text-xs space-y-1">
          {segments.slice(0, 4).map((segment, index) => ( // Show top 4
            <li key={index} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: segment.color }}></span>
                <span className="font-semibold truncate">{segment.label}:</span>
                <span className="text-foreground/80 ml-auto">{segment.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DoughnutChart;