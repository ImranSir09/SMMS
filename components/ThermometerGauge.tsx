import React from 'react';

interface ThermometerGaugeProps {
    label: string;
    value: number; // 0-100
}

const ThermometerGauge: React.FC<ThermometerGaugeProps> = ({ label, value }) => {
    const fillHeight = Math.min(100, Math.max(0, value));
    
    let fillColor = 'bg-red-500';
    if (fillHeight > 66) {
        fillColor = 'bg-green-500';
    } else if (fillHeight > 33) {
        fillColor = 'bg-yellow-500';
    }

    return (
        <div className="flex flex-col items-center">
            <div className="text-center text-xs font-semibold p-1 bg-cyan-200 border border-cyan-400 rounded-t-md w-full">{label}</div>
            <div className="w-16 h-40 bg-gray-200 rounded-b-md p-1 flex justify-center border-2 border-gray-400">
                <div className="relative w-8 h-full bg-white rounded-full border border-gray-400">
                    {/* Background Ticks */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full flex flex-col-reverse justify-between">
                        {[...Array(11)].map((_, i) => (
                            <div key={i} className="h-px bg-gray-400 w-full" style={{ bottom: `${i * 10}%` }}></div>
                        ))}
                    </div>
                    {/* Fill */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ${fillColor}`}
                        style={{ height: `${fillHeight}%` }}
                    ></div>
                    {/* Bulb */}
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-gray-400 bg-gray-200 flex items-center justify-center`}>
                        <div className={`w-10 h-10 rounded-full ${fillColor}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThermometerGauge;
