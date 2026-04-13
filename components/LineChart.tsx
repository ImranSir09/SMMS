
import React from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const width = 300;
  const height = 150;
  
  const maxValue = 100; // Fixed at 100 for percentage
  const minValue = 0;

  const xScale = (index: number) => {
    if (data.length === 1) {
      return padding.left + (width - padding.left - padding.right) / 2;
    }
    return padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  };
  
  const yScale = (value: number) => height - padding.bottom - ((value - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);

  const linePath = data.length > 1
    ? data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(point.value)}`).join(' ')
    : '';

  const yAxisLabels = [0, 25, 50, 75, 100];

  return (
    <div>
        <h4 className="text-sm font-semibold text-center mb-2">{title}</h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-axis grid lines and labels */}
            {yAxisLabels.map(label => (
                <g key={label}>
                    <line
                        x1={padding.left}
                        y1={yScale(label)}
                        x2={width - padding.right}
                        y2={yScale(label)}
                        stroke="var(--border)"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                    />
                    <text
                        x={padding.left - 5}
                        y={yScale(label)}
                        dy="0.32em"
                        textAnchor="end"
                        fontSize="8"
                        fill="var(--foreground)"
                        opacity="0.7"
                    >
                        {label}%
                    </text>
                </g>
            ))}

            {/* X-axis labels */}
            {data.map((point, i) => (
                <text
                    key={i}
                    x={xScale(i)}
                    y={height - padding.bottom + 15}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--foreground)"
                    opacity="0.7"
                >
                    {point.label}
                </text>
            ))}
            
            {/* Data line */}
            <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" />
            
            {/* Data points */}
            {data.map((point, i) => (
                <g key={i}>
                    <circle cx={xScale(i)} cy={yScale(point.value)} r="3" fill="var(--primary)" />
                    <title>{`${point.label}: ${point.value}%`}</title>
                </g>
            ))}
        </svg>
    </div>
  );
};

export default LineChart;
