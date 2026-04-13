import React from 'react';

export interface ChartDataPoint {
  label: string;
  isSunday?: boolean;
  values: {
    balvatika: number;
    primary: number;
    middle: number;
  };
}

interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.values.balvatika + d.values.primary + d.values.middle), 10);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex justify-between items-end h-64 space-x-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 h-full flex flex-col justify-end items-center group relative">
            <div
              className={`w-full flex flex-col-reverse justify-end rounded-t-md ${item.isSunday ? 'bg-red-200 dark:bg-red-900/50' : 'bg-transparent'}`}
              style={{ height: `${((item.values.balvatika + item.values.primary + item.values.middle) / maxValue) * 100}%` }}
            >
              <div className="bg-yellow-500 w-full" style={{ height: `${(item.values.middle / (item.values.balvatika + item.values.primary + item.values.middle || 1)) * 100}%` }}></div>
              <div className="bg-green-500 w-full" style={{ height: `${(item.values.primary / (item.values.balvatika + item.values.primary + item.values.middle || 1)) * 100}%` }}></div>
              <div className="bg-blue-500 w-full rounded-t-md" style={{ height: `${(item.values.balvatika / (item.values.balvatika + item.values.primary + item.values.middle || 1)) * 100}%` }}></div>
            </div>
            <span className="text-xs mt-1 text-foreground/70">{item.label}</span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-48 bg-background border border-border text-foreground p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="font-bold text-sm">Day: {item.label}</p>
              <p className="text-xs text-blue-500">Balvatika: {item.values.balvatika}</p>
              <p className="text-xs text-green-500">Primary: {item.values.primary}</p>
              <p className="text-xs text-yellow-500">Middle: {item.values.middle}</p>
              <p className="text-xs font-semibold mt-1">Total: {item.values.balvatika + item.values.primary + item.values.middle}</p>
              {item.isSunday && <p className="text-xs text-red-500 mt-1">Sunday</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center flex-wrap items-center space-x-4 mt-4 text-xs">
        <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> Balvatika</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-sm mr-1"></span> Primary</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></span> Middle</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded-sm mr-1"></span> Sunday</div>
      </div>
    </div>
  );
};

export default BarChart;
