import React from 'react';

interface ReportCardThermometerProps {
    label: string;
    value: number; // 0-100
}

const ReportCardThermometer: React.FC<ReportCardThermometerProps> = ({ label, value }) => {
    const fillHeight = Math.min(100, Math.max(0, value));
    
    const getFillColor = () => {
        if (value >= 80) return '#22c55e'; // green-500
        if (value >= 60) return '#3b82f6'; // blue-500
        if (value >= 40) return '#eab308'; // yellow-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-center text-[9px] font-bold p-1 bg-cyan-400 border border-black rounded-t-md w-full">{label}</div>
            <div className="w-full h-48 bg-white p-2 flex justify-center border-x border-b border-black rounded-b-md relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                {/* Background Ticks */}
                <div className="absolute top-2 bottom-2 left-2 right-2 flex flex-col-reverse justify-between">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="flex items-center w-full">
                            <span className="text-[7px] -ml-2">{i * 10}</span>
                            <div className="h-px bg-gray-300 flex-grow ml-1"></div>
                        </div>
                    ))}
                </div>
                {/* Main thermometer tube */}
                <div className="relative w-6 h-full bg-gray-200 rounded-full border border-gray-400 overflow-hidden z-10">
                    {/* Fill */}
                    <div
                        className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-500"
                        style={{ height: `${fillHeight}%`, backgroundColor: getFillColor() }}
                    ></div>
                </div>
                 {/* Bulb */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-gray-500 bg-white flex items-center justify-center z-20">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: getFillColor() }}></div>
                </div>
            </div>
        </div>
    );
};

export default ReportCardThermometer;
