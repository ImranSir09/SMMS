import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Staff, TimetableSlot } from '../types';
import TimetableDisplay from '../components/TimetableDisplay';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]; // Represents 8 periods in a day

const Timetable: React.FC = () => {
  const staff = useLiveQuery(() => db.staff.filter(s => s.teachingAssignments && s.teachingAssignments.length > 0).toArray(), []);
  const timetableSlots = useLiveQuery(() => db.timetable.toArray(), []);

  const handleSlotChange = async (staffId: number, day: string, period: number, value: string) => {
    const existingSlot = await db.timetable.where({ staffId, day, period }).first();

    if (value === 'NONE') {
      if (existingSlot) {
        await db.timetable.delete(existingSlot.id!);
      }
      return;
    }

    const [className, subject] = value.split(' - ');
    const newSlot: TimetableSlot = { staffId, day, period, className, subject };

    if (existingSlot) {
      await db.timetable.update(existingSlot.id!, { className, subject });
    } else {
      await db.timetable.add(newSlot);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('timetable-print-area')?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  if (!staff || !timetableSlots) {
    return <div>Loading timetable data...</div>;
  }
  
  const teachingStaff = staff as Staff[];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">School Timetable</h1>
          <p className="text-foreground/70 mt-1">
            Assign classes to teachers for each time slot. Changes are saved automatically.
          </p>
        </div>
        <button onClick={handlePrint} className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors">
          Print Timetable
        </button>
      </div>
      
      {teachingStaff.length > 0 ? (
        <div id="timetable-print-area">
          <TimetableDisplay
            staff={teachingStaff}
            slots={timetableSlots}
            days={DAYS}
            periods={PERIODS}
            onSlotChange={handleSlotChange}
          />
        </div>
      ) : (
        <div className="text-center py-10 border border-border rounded-lg bg-background/50">
          <p className="text-foreground/60">
            No staff members have teaching assignments.
          </p>
          <p className="text-foreground/60 mt-1">
            Please edit staff profiles to add assignments first.
          </p>
        </div>
      )}
    </div>
  );
};

export default Timetable;
