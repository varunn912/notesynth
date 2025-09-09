import React from 'react';

interface NoteboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const NoteboardCard: React.FC<NoteboardCardProps> = ({ title, icon, children, style }) => {
  return (
    <div 
      className="bg-base-200 rounded-lg p-4 border border-base-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand-secondary/50 animate-slide-in-up"
      style={style}
    >
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-base-content">
        <span className="text-brand-secondary">{icon}</span>
        {title}
      </h3>
      <div className="text-base-content-secondary space-y-3 text-sm">{children}</div>
    </div>
  );
};