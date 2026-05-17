import React from 'react';
import type { Module } from '../../../types/domain';
import { Check } from 'lucide-react';

interface ModuleNodeProps {
  module: Module;
  isLeft: boolean;
  isSelected: boolean;
  onClick: (module: Module) => void;
}

export const ModuleNode: React.FC<ModuleNodeProps> = ({ module, isLeft, isSelected, onClick }) => {
  // We use a 320px wide grid where the center path is at x=160px.
  // The curve shifts horizontally left or right.
  const pathD = isLeft 
    ? "M 160 0 C 160 60, 40 36, 40 96 C 40 156, 160 132, 160 192"
    : "M 160 0 C 160 60, 280 36, 280 96 C 280 156, 160 132, 160 192";

  return (
    <div className="relative w-[320px] mx-auto h-[192px] group" onClick={() => onClick(module)}>
      {/* The SVG curve for exactly this section */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 192">
        <path 
          d={pathD} 
          fill="none" 
          stroke="#A89E8D" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </svg>
      
      {/* Node Circle positioned on the peak of the curve */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-10
          ${isLeft ? 'left-[40px] -translate-x-1/2' : 'left-[280px] -translate-x-1/2'}
        `}
      >
        <button 
          className={`
            w-14 h-14 rounded-full flex items-center justify-center bg-[#F8F5EE] border border-[#D5CDBC] cursor-pointer
            ${isSelected ? 'ring-8 ring-forest-600/20 shadow-md' : 'ring-8 ring-[#F0EBE0] group-hover:ring-[#E5DEC7] shadow-sm'}
            transition-all duration-300
          `}
          aria-label={`Select ${module.title}`}
        >
          <Check className={`w-6 h-6 transition-colors duration-300 ${isSelected ? 'text-forest-700' : 'text-[#4A3C31]'}`} strokeWidth={3} />
        </button>
      </div>

      {/* Floating text to the side of the node */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-56 cursor-pointer
          ${isLeft ? 'right-[296px] text-right' : 'left-[304px] text-left'}
        `}
      >
        <div className="uppercase tracking-[0.2em] text-[#A89E8D] text-[10px] font-bold mb-1">
          Mod.{module.order}
        </div>
        <h4 className="font-serif text-[1.25rem] font-bold text-[#5c3724] leading-[1.3] group-hover:text-[#8c5233] transition-colors overflow-visible">
          {module.title}
        </h4>
      </div>
    </div>
  );
};
