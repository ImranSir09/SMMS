import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { db } from '../services/db';
import { DailyLog } from '../types';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
  existingLog: DailyLog | null;
}

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";

const DailyLogModal: React.FC<DailyLogModalProps> = ({ isOpen, onClose, date, existingLog }) => {
  const [formData, setFormData] = useState({
    attendanceBalvatika: 0,
    attendancePrimary: 0,
    attendanceMiddle: 0,
    expenditure: 0,
    riceConsumed: 0,
  });

  useEffect(() => {
    if (existingLog) {
      setFormData({
        attendanceBalvatika: existingLog.attendanceBalvatika,
        attendancePrimary: existingLog.attendancePrimary,
        attendanceMiddle: existingLog.attendanceMiddle,
        expenditure: existingLog.expenditure,
        riceConsumed: existingLog.riceConsumed,
      });
    } else {
      setFormData({
        attendanceBalvatika: 0,
        attendancePrimary: 0,
        attendanceMiddle: 0,
        expenditure: 0,
        riceConsumed: 0,
      });
    }
  }, [existingLog, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    const sanitizedValue = isNaN(numValue) || numValue < 0 ? 0 : numValue;
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const logData: Partial<DailyLog> = {
      ...formData,
      date,
    };
    if (existingLog && existingLog.id) {
        logData.id = existingLog.id;
    }
    await db.dailyLogs.put(logData as DailyLog);
    onClose();
  };
  
  const totalAttendance = formData.attendanceBalvatika + formData.attendancePrimary + formData.attendanceMiddle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entry for ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Student Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="attendanceBalvatika" className={labelStyle}>Balvatika</label>
                <input type="number" id="attendanceBalvatika" name="attendanceBalvatika" value={formData.attendanceBalvatika} onChange={handleChange} className={inputStyle} min="0"/>
              </div>
              <div>
                <label htmlFor="attendancePrimary" className={labelStyle}>Primary</label>
                <input type="number" id="attendancePrimary" name="attendancePrimary" value={formData.attendancePrimary} onChange={handleChange} className={inputStyle} min="0"/>
              </div>
              <div>
                <label htmlFor="attendanceMiddle" className={labelStyle}>Middle</label>
                <input type="number" id="attendanceMiddle" name="attendanceMiddle" value={formData.attendanceMiddle} onChange={handleChange} className={inputStyle} min="0"/>
              </div>
            </div>
            <p className="text-right text-sm font-semibold mt-2">Total Attendance: {totalAttendance}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Consumption & Expenditure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expenditure" className={labelStyle}>Total Expenditure (₹)</label>
                <input type="number" id="expenditure" name="expenditure" value={formData.expenditure} onChange={handleChange} className={inputStyle} min="0" step="0.01"/>
              </div>
              <div>
                <label htmlFor="riceConsumed" className={labelStyle}>Total Rice (kg)</label>
                <input type="number" id="riceConsumed" name="riceConsumed" value={formData.riceConsumed} onChange={handleChange} className={inputStyle} min="0" step="0.001"/>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white transition-colors">Cancel</button>
            <button type="submit" className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground transition-colors">Save Entry</button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DailyLogModal;