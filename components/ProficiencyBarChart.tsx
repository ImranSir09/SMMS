import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ProficiencyBarChartProps {
  data: ChartData[];
  title: string;
}

const ProficiencyBarChart: React.FC<ProficiencyBarChartProps> = ({ data, title }) => {
  const maxValue = 5; // The chart in the image has a max Y-axis value of 5

  return (
    <div className="border border-black p-1 w-full h-full flex flex-col text-[10px]">
      <h3 className="text-center font-semibold">{title}</h3>
      <div className="flex-grow flex items-end justify-around gap-2 px-2 relative">
        {/* Y-axis lines and labels */}
        <div className="absolute top-0 bottom-[15px] left-2 right-2 flex flex-col justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center w-full h-0">
                <span className="text-[8px] -ml-2.5 transform -translate-y-1/2">{5 - i}</span>
                <div className="h-px bg-gray-300 flex-grow ml-1"></div>
            </div>
          ))}
        </div>
        
        {data.map((item) => (
          <div key={item.label} className="flex flex-col items-center h-full justify-end z-10">
            <div
              className="w-6"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
              }}
            ></div>
            <span className="text-[10px] mt-1">{item.label}</span>
          </div>
        ))}
      </div>
       <div className="flex justify-center items-center space-x-2 mt-1 border-t border-gray-400 pt-1">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-[8px]">
            <div className="w-2 h-2" style={{ backgroundColor: item.color }}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProficiencyBarChart;
