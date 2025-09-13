
import React from 'react';
import { TimetableSlot } from '../types';

interface StaffTimetableProps {
  slots: TimetableSlot[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const StaffTimetable: React.FC<StaffTimetableProps> = ({ slots }) => {
  const slotsMap = new Map<string, TimetableSlot>();
  slots.forEach(slot => {
    slotsMap.set(`${slot.day}-${slot.period}`, slot);
  });

  return (
    <div className="overflow-x-auto text-xs">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-background/50">
            <th className="p-1 border border-border font-semibold">Period</th>
            {DAYS.map(day => (
              <th key={day} className="p-1 border border-border font-semibold">{day.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map(period => (
            <tr key={period} className={`${period === 4 ? 'border-b-2 border-b-red-500/50' : ''}`}>
              <td className="p-1 border border-border font-semibold bg-background/50">{period}</td>
              {DAYS.map(day => {
                const slot = slotsMap.get(`${day}-${period}`);
                return (
                  <td key={day} className="p-1 border border-border h-8">
                    {slot ? `${slot.className}-${slot.subject.slice(0,3)}` : '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffTimetable;