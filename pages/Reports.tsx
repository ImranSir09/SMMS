import React from 'react';
import Card from '../components/Card';
import { ReportsIcon } from '../components/icons';

const Reports: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <Card className="p-6">
        <div className="text-center py-10">
          <div className="flex justify-center mb-4">
              <ReportsIcon className="w-12 h-12 text-primary/50" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Reporting Feature Coming Soon
          </h2>
          <p className="mt-2 text-foreground/70">
            This section will provide detailed reports and analytics for students, staff, and examinations.
          </p>
          <p className="mt-1 text-foreground/70">
            Stay tuned for updates!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;