import React from 'react';
import { Staff, TimetableSlot } from '../types';

interface TimetableDisplayProps {
  staff: Staff[];
  slots: TimetableSlot[];
  day: string;
  onSlotChange?: (staffId: number, day: string, period: number, value: string) => void;
}

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const PERIOD_TIMES: { [key: number]: string } = { 1: '9-10', 2: '10-11', 3: '11-12', 4: '12-1', 5: '2-3', 6: '3-4', 7: '4-5', 8: '5-6' };

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ staff, slots, day, onSlotChange }) => {
  const slotsMap = new Map<string, TimetableSlot>();
  slots.forEach(slot => {
    slotsMap.set(`${slot.staffId}-${slot.day}-${slot.period}`, slot);
  });

  const classScheduleMap = new Map<string, string>(); // key: 'day-period-className', value: staffName
  slots.forEach(slot => {
    const staffMember = staff.find(s => s.id === slot.staffId);
    if (staffMember) {
        classScheduleMap.set(`${slot.day}-${slot.period}-${slot.className}`, staffMember.name);
    }
  });

  const isSelectable = !!onSlotChange;

  return (
    <div className="h-full overflow-auto border border-border rounded-lg bg-card text-[10px]">
      <table className="w-full border-collapse text-center">
        <thead className="sticky top-0 bg-background z-10">
          <tr>
            <th className="p-1 border-b border-r border-border font-semibold sticky left-0 bg-background z-20">Teacher</th>
            {PERIODS.map(p => (
                <th key={p} className={`p-1 border-b border-r border-border font-medium ${p === 4 ? 'border-r-2 border-r-red-500/50' : ''}`}>
                    {PERIOD_TIMES[p]}
                </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staff.map(member => (
            <tr key={member.id}>
              <td className="p-1 border-b border-r border-border font-semibold whitespace-nowrap sticky left-0 bg-card z-10">{member.name}</td>
              {PERIODS.map(period => {
                const slot = slotsMap.get(`${member.id}-${day}-${period}`);
                const value = slot ? `${slot.className}-${slot.subject}` : 'NONE';
                return (
                  <td key={period} className={`p-0 border-b border-r border-border ${period === 4 ? 'border-r-2 border-r-red-500/50' : ''}`}>
                    {isSelectable ? (
                      <select 
                          value={value} 
                          onChange={(e) => onSlotChange(member.id!, day, period, e.target.value)}
                          className="w-full h-full bg-transparent p-0.5 border-0 focus:ring-0 appearance-none text-center"
                      >
                        <option value="NONE">--</option>
                        {member.teachingAssignments.map(a => {
                            const key = `${day}-${period}-${a.className}`;
                            const assignedTeacher = classScheduleMap.get(key);
                            const isOccupied = assignedTeacher && assignedTeacher !== member.name;
                            return (
                              <option key={`${a.className}-${a.subject}`} value={`${a.className} - ${a.subject}`} disabled={isOccupied} title={isOccupied ? `By ${assignedTeacher}` : ''}>
                                  {a.className}-{a.subject.slice(0,3)}
                              </option>
                            );
                        })}
                      </select>
                    ) : (
                      <div>{value !== 'NONE' ? value : ''}</div>
                    )}
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

export default TimetableDisplay;