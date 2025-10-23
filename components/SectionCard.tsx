import React from 'react';

const SectionCard: React.FC<{ title: string; colorClasses: string; children: React.ReactNode; }> = ({ title, colorClasses, children }) => {
    const [headerColor, bodyColor, textColor] = colorClasses.split(' ');
    return (
        <div className={`border-2 ${bodyColor} rounded-lg mt-4 shadow-md`}>
            <h2 className={`text-md font-bold p-2 ${headerColor} ${textColor} rounded-t-md`}>
                {title}
            </h2>
            <div className="p-3 bg-card">{children}</div>
        </div>
    );
};

export default SectionCard;
