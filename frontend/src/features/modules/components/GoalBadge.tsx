import React from 'react';
import { Award } from 'lucide-react';

interface GoalBadgeProps {
  finalGoalY: number;
}

export const GoalBadge: React.FC<GoalBadgeProps> = ({ finalGoalY }) => {
  return (
    <div
      className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: '50%', top: `${finalGoalY}px` }}
    >
      {/* Main Node */}
      <div className="w-[72px] h-[72px] bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center p-1 z-20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#eadfce] transition-transform duration-300 group-hover:scale-105">
        <div className="w-full h-full bg-gradient-to-br from-[#EACE9B] to-[#C98A43] rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
          {/* Shine effect that moves on hover */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          <Award className="w-8 h-8 text-white relative z-10 drop-shadow-md" strokeWidth={2.5} />
        </div>
      </div>

      {/* Badge Label */}
      <div className="mt-3 flex flex-col items-center z-20">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-4 py-2.5 md:px-7 md:py-3 rounded-2xl border border-[#DECFB3] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-[#C98A43]/40">
          <div className="w-6 md:w-8 h-[1.5px] bg-gradient-to-r from-transparent to-[#C98A43]/60" />
          <h3 className="font-serif text-sm md:text-[1.15rem] font-bold text-[#5c3724] tracking-wide text-center whitespace-nowrap">
            Konec modula
          </h3>
          <div className="w-6 md:w-8 h-[1.5px] bg-gradient-to-l from-transparent to-[#C98A43]/60" />
        </div>
      </div>
    </div>
  );
};


