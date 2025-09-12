import React from 'react';
import { Staff, TimetableSlot } from '../types';

interface TimetableDisplayProps {
  staff: Staff[];
  slots: TimetableSlot[];
  days: string[];
  periods: number[];
  onSlotChange?: (staffId: number, day: string, period: number, value: string) => void;
}

const PERIOD_TIMES: { [key: number]: string } = {
    1: '9-10 AM',
    2: '10-11 AM',
    3: '11-12 PM',
    4: '12-1 PM',
    5: '2-3 PM',
    6: '3-4 PM',
    7: '4-5 PM',
    8: '5-6 PM',
};

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ staff, slots, days, periods, onSlotChange }) => {
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
    <div className="overflow-x-auto border border-border rounded-lg bg-card p-1">
      <style>{`
        @media print {
          @page { size: A2 landscape; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .timetable-table { font-size: 10px; }
          .timetable-table select { display: none; }
          .timetable-table .print-content { display: block !important; }
        }
      `}</style>
      <table className="w-full border-collapse text-center timetable-table">
        <thead>
          <tr className="bg-background">
            <th className="p-2 border border-border font-semibold sticky left-0 bg-background z-10">Teacher</th>
            {days.map(day => (
              <th key={day} colSpan={periods.length / 2 + 1} className="p-2 border border-border font-semibold">{day}</th>
            ))}
          </tr>
          <tr className="bg-background/50">
            <th className="p-2 border border-border font-semibold sticky left-0 bg-background/50 z-10">Period</th>
            {days.map(day => (
              <React.Fragment key={day}>
                {periods.slice(0, 4).map(p => <th key={`${day}-p${p}`} className="p-1 border border-border font-medium text-xs w-24">{PERIOD_TIMES[p]}</th>)}
                <th className="p-1 border border-border font-medium text-xs bg-yellow-100 dark:bg-yellow-800/50 w-24">1-2 PM RECESS</th>
                {periods.slice(4).map(p => <th key={`${day}-p${p}`} className="p-1 border border-border font-medium text-xs w-24">{PERIOD_TIMES[p]}</th>)}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {staff.map(member => (
            <tr key={member.id}>
              <td className="p-2 border border-border font-semibold text-sm whitespace-nowrap sticky left-0 bg-card z-10">{member.name}</td>
              {days.map(day => (
                <React.Fragment key={day}>
                    {periods.slice(0,4).map(period => {
                       const slot = slotsMap.get(`${member.id}-${day}-${period}`);
                       const value = slot ? `${slot.className} - ${slot.subject}` : 'NONE';
                        return (
                          <td key={`${day}-${period}`} className="p-0 border border-border">
                             {isSelectable ? (
                                <select 
                                    value={value} 
                                    onChange={(e) => onSlotChange(member.id!, day, period, e.target.value)}
                                    className="w-full h-full bg-transparent text-xs p-1 border-0 focus:ring-0 appearance-none text-center"
                                >
                                  <option value="NONE">-- Free --</option>
                                  {member.teachingAssignments.map(a => {
                                      const key = `${day}-${period}-${a.className}`;
                                      const assignedTeacher = classScheduleMap.get(key);
                                      const isOccupied = assignedTeacher && assignedTeacher !== member.name;
                                      return (
                                        <option key={`${a.className}-${a.subject}`} value={`${a.className} - ${a.subject}`} disabled={isOccupied} title={isOccupied ? `Occupied by ${assignedTeacher}` : ''}>
                                            {a.className} - {a.subject}
                                        </option>
                                      );
                                  })}
                                </select>
                             ) : (
                                <div className="p-1 text-xs">{value !== 'NONE' ? value : ''}</div>
                             )}
                          </td>
                        );
                    })}
                    <td className="border border-border bg-yellow-100/50 dark:bg-yellow-800/30"></td>
                    {periods.slice(4).map(period => {
                       const slot = slotsMap.get(`${member.id}-${day}-${period}`);
                       const value = slot ? `${slot.className} - ${slot.subject}` : 'NONE';
                        return (
                          <td key={`${day}-${period}`} className="p-0 border border-border">
                             {isSelectable ? (
                                <select 
                                    value={value} 
                                    onChange={(e) => onSlotChange(member.id!, day, period, e.target.value)}
                                    className="w-full h-full bg-transparent text-xs p-1 border-0 focus:ring-0 appearance-none text-center"
                                >
                                  <option value="NONE">-- Free --</option>
                                  {member.teachingAssignments.map(a => {
                                      const key = `${day}-${period}-${a.className}`;
                                      const assignedTeacher = classScheduleMap.get(key);
                                      const isOccupied = assignedTeacher && assignedTeacher !== member.name;
                                      return (
                                        <option key={`${a.className}-${a.subject}`} value={`${a.className} - ${a.subject}`} disabled={isOccupied} title={isOccupied ? `Occupied by ${assignedTeacher}` : ''}>
                                            {a.className} - {a.subject}
                                        </option>
                                      );
                                  })}
                                </select>
                             ) : (
                                <div className="p-1 text-xs">{value !== 'NONE' ? value : ''}</div>
                             )}
                          </td>
                        );
                    })}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableDisplay;
