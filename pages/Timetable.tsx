import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Staff, TimetableSlot } from '../types';
import TimetableDisplay from '../components/TimetableDisplay';
import { PrintIcon } from '../components/icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const staff = useLiveQuery(() => db.staff.filter(s => s.teachingAssignments && s.teachingAssignments.length > 0).toArray(), []);
  const timetableSlots = useLiveQuery(() => db.timetable.toArray(), []);

  const handleSlotChange = async (staffId: number, day: string, period: number, value: string) => {
    const existingSlot = await db.timetable.where({ staffId, day, period }).first();

    if (value === 'NONE') {
      if (existingSlot) await db.timetable.delete(existingSlot.id!);
      return;
    }

    const [className, subject] = value.split(' - ');
    const newSlot: TimetableSlot = { staffId, day, period, className, subject };

    if (existingSlot) await db.timetable.update(existingSlot.id!, { className, subject });
    else await db.timetable.add(newSlot);
  };

  const handlePrint = () => alert("Printing for the new compact view is under development.");

  if (!staff || !timetableSlots) {
    return <div>Loading timetable data...</div>;
  }
  
  const teachingStaff = staff as Staff[];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex-shrink-0 grid grid-cols-4 gap-1 mb-2">
          {DAYS.slice(0, 4).map(day => (
              <button key={day} onClick={() => setSelectedDay(day)} className={`p-2 text-xs font-semibold rounded-md transition-colors ${selectedDay === day ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  {day.slice(0,3)}
              </button>
          ))}
      </div>
      <div className="flex-shrink-0 grid grid-cols-4 gap-1 mb-2">
          {DAYS.slice(4).map(day => (
              <button key={day} onClick={() => setSelectedDay(day)} className={`p-2 text-xs font-semibold rounded-md transition-colors ${selectedDay === day ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  {day.slice(0,3)}
              </button>
          ))}
          <button onClick={handlePrint} className="col-span-2 p-2 flex items-center justify-center gap-1 text-xs font-semibold rounded-md bg-card">
            <PrintIcon className="w-4 h-4" /> Print
          </button>
      </div>
      
      {teachingStaff.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <TimetableDisplay
            staff={teachingStaff}
            slots={timetableSlots}
            day={selectedDay}
            onSlotChange={handleSlotChange}
          />
        </div>
      ) : (
        <div className="flex-1 text-center py-10 border border-border rounded-lg bg-background/50 flex flex-col justify-center">
          <p className="text-sm text-foreground/60">No teaching staff found.</p>
          <p className="text-xs text-foreground/60 mt-1">Add teaching assignments to staff profiles first.</p>
        </div>
      )}
    </div>
  );
};

export default Timetable;