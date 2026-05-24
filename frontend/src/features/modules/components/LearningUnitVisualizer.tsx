import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LearningUnitReferenceResponse, LearningUnitResponse } from '../../../types/learning-unit';
import { BookOpen, Check, X, ArrowRight } from 'lucide-react';

interface LearningUnitVisualizerProps {
  references: LearningUnitReferenceResponse[];
  details?: LearningUnitResponse[];
  completedUnitIds?: string[];
}

export const LearningUnitVisualizer: React.FC<LearningUnitVisualizerProps> = ({
  references,
  details = [],
  completedUnitIds = []
}) => {
  const navigate = useNavigate();
  const [selectedUnits, setSelectedUnits] = useState<LearningUnitReferenceResponse[] | null>(null);

  const handleNodeClick = (units: LearningUnitReferenceResponse[]) => {
    if (units.length === 1) {
      navigate(`/learning-units/${units[0].learning_unit_id}`);
    } else if (units.length > 1) {
      setSelectedUnits(units);
    }
  };

  const closeModal = () => setSelectedUnits(null);
  const handleUnitClick = (unitId: string) => {
    navigate(`/learning-units/${unitId}`);
  };

  // Group references by order
  const groupedUnits = references.reduce((acc, ref) => {
    const order = ref.order ?? 999;
    if (!acc[order]) {
      acc[order] = [];
    }
    acc[order].push(ref);
    return acc;
  }, {} as Record<number, LearningUnitReferenceResponse[]>);

  const sortedOrders = Object.keys(groupedUnits).map(Number).sort((a, b) => a - b);
  const numNodes = sortedOrders.length;

  const SWING = 160;
  const CENTER_X = 400;
  const OFFSET_TOP = 80;

  const nodePositions: { x: number, y: number, isRight: boolean }[] = [];
  let currentY = OFFSET_TOP;

  for (let i = 0; i < numNodes; i++) {
    const isRight = i % 2 === 0;
    const targetX = isRight ? CENTER_X + SWING : CENTER_X - SWING;
    
    nodePositions.push({ x: targetX, y: currentY, isRight });
    
    // Dynamically calculate the vertical space needed based on number of parallel units
    const unitsInThisStep = groupedUnits[sortedOrders[i]].length;
    const requiredHeight = Math.max(180, unitsInThisStep * 115 + 40); 
    currentY += requiredHeight;
  }

  const finalGoalY = numNodes > 0 ? currentY + 20 : OFFSET_TOP + 100;
  const totalHeight = finalGoalY + 120;

  let pathD = `M ${CENTER_X} 0`;
  let prevX = CENTER_X;
  let prevY = 0;

  for (let i = 0; i < numNodes; i++) {
    const pos = nodePositions[i];
    const cpY = (prevY + pos.y) / 2;
    pathD += ` C ${prevX} ${cpY}, ${pos.x} ${cpY}, ${pos.x} ${pos.y}`;
    prevX = pos.x;
    prevY = pos.y;
  }

  if (numNodes > 0) {
    const cpY = (prevY + finalGoalY) / 2;
    pathD += ` C ${prevX} ${cpY}, ${CENTER_X} ${cpY}, ${CENTER_X} ${finalGoalY}`;
  } else {
    pathD += ` L ${CENTER_X} ${finalGoalY}`;
  }

  return (
    <div className="relative w-full py-8 flex flex-col items-center overflow-hidden">
      {numNodes === 0 ? (
        <div className="text-center text-[#8B7355] py-12">
          Ni učnih enot za ta modul.
        </div>
      ) : (
        <div className="relative w-full max-w-[800px] overflow-visible" style={{ height: `${totalHeight}px` }}>
          
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox={`0 0 800 ${totalHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <linearGradient id="lu-path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7DAE8C" />
                <stop offset="60%" stopColor="#A4B98E" />
                <stop offset="100%" stopColor="#C4B491" />
              </linearGradient>
            </defs>
            <path 
              d={pathD}
              fill="none"
              stroke="url(#lu-path-gradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>

          {sortedOrders.map((order, i) => {
            const pos = nodePositions[i];
            const units = groupedUnits[order];
            
            const requiredUnits = units.filter(u => u.is_required);
            const isStepCompleted = requiredUnits.length > 0 
              ? requiredUnits.every(u => completedUnitIds.includes(u.learning_unit_id))
              : units.length > 0 && units.every(u => completedUnitIds.includes(u.learning_unit_id));
            
            return (
              <div 
                key={order}
                className="absolute group z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${pos.y}px` }}
              >
                {/* Center Node */}
                <button
                  type="button"
                  onClick={() => handleNodeClick(units)}
                  className={`
                    w-[56px] h-[56px] rounded-full flex items-center justify-center relative z-20 shadow-sm cursor-pointer
                    hover:ring-8 transition-all duration-300
                    ${isStepCompleted 
                      ? 'bg-[#31583b] border border-[#31583b] hover:ring-[#31583b]/30 scale-105' 
                      : 'bg-[#F2EDE1] border-[1.5px] border-[#DECFB3] hover:ring-[#EACE9B]/40 hover:scale-105 hover:bg-white'}
                  `}
                >
                  {isStepCompleted ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <BookOpen className="w-6 h-6 text-[#5c4d3c]" strokeWidth={2} />
                  )}
                  {units.length > 1 && (
                    <div className="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#C98A43] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#fffdf8] shadow-sm">
                      {units.length}
                    </div>
                  )}
                </button>
                
                {/* Floating Labels (Parallel Units container) */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-[260px] md:w-[280px] flex flex-col gap-3 ${pos.isRight ? 'left-[70px] md:left-[90px]' : 'right-[70px] md:right-[90px]'}`}
                >
                  <div className={`uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 ${pos.isRight ? 'text-left' : 'text-right'}`}>
                    Stopnja {i + 1}
                  </div>
                  
                  {units.map((ref) => {
                    const detail = details.find(d => d._id === ref.learning_unit_id);
                    const isUnitCompleted = completedUnitIds.includes(ref.learning_unit_id);
                    return (
                      <button
                        type="button"
                        onClick={() => handleUnitClick(ref.learning_unit_id)}
                        key={ref.learning_unit_id}
                        className={`backdrop-blur-sm p-4 rounded-xl border shadow-sm w-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col group/card ${pos.isRight ? 'text-left' : 'text-right'} ${isUnitCompleted ? 'bg-[#f4f7f5]/90 border-[#31583b] hover:border-[#31583b]' : 'bg-white/90 border-[#DECFB3] hover:border-[#C98A43]/50'}`}
                      >
                        <div className={`w-full flex items-start gap-2 ${pos.isRight ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
                          <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 transition-colors ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#5c3724] group-hover/card:text-[#C98A43]'} ${pos.isRight ? 'text-left' : 'text-right'}`}>
                            {detail?.title || 'Neznana učna enota'}
                          </h4>
                          {isUnitCompleted ? (
                            <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#31583b] flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          ) : (
                            <ArrowRight className={`w-4 h-4 mt-1 text-[#C98A43] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex-shrink-0 ${pos.isRight ? '' : 'rotate-180'}`} />
                          )}
                        </div>
                        {detail?.short_description && (
                          <p className={`text-xs line-clamp-2 mt-1.5 leading-relaxed ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'} ${pos.isRight ? 'text-left' : 'text-right'}`}>
                            {detail.short_description}
                          </p>
                        )}
                        {!ref.is_required && (
                          <span className={`mt-3 inline-block px-2 py-1 border rounded text-[9px] uppercase font-bold ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'} ${pos.isRight ? 'self-start' : 'self-end'}`}>
                            Izbirno
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Goal Node */}
          <div 
            className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '50%', top: `${finalGoalY}px` }}
          >
            <div className="w-[64px] h-[64px] bg-[#F2EDE1] rounded-full flex items-center justify-center p-1.5 z-20 shadow-sm">
              <div className="w-full h-full bg-[#D5BE9E] rounded-full flex items-center justify-center shadow-inner">
                <Check className="w-7 h-7 text-white" strokeWidth={3}/>
              </div>
            </div>
            <div className="absolute top-[76px] w-64 text-center">
              <h3 className="font-serif font-bold text-lg text-[#5c3724]">
                 Konec modula
              </h3>
            </div>
          </div>

        </div>
      )}

      {/* Sleek Selection Modal */}
      {selectedUnits && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <style>{`
            @keyframes overlayFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalSlideUp {
              from { opacity: 0; transform: scale(0.95) translateY(20px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
          <div 
            className="absolute inset-0 bg-[#392f23]/40 backdrop-blur-sm"
            onClick={closeModal}
            style={{ animation: 'overlayFadeIn 0.3s ease-out forwards' }}
          />
          <div 
            className="relative w-full max-w-lg bg-[#fffdf8] rounded-[24px] shadow-[0_24px_48px_-12px_rgba(57,47,35,0.25)] border border-[#eadfce] overflow-hidden flex flex-col"
            style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eadfce] bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f4eee4] flex items-center justify-center text-[#31583b]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[20px] text-[#111111] leading-tight">
                    Izbira učne enote
                  </h3>
                  <p className="text-[13px] text-[#706b60] mt-0.5">
                    Ta korak vsebuje več vzporednih enot
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#a69c8f] hover:text-[#111111] hover:bg-[#f4eee4] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-[#fffdf8]">
              <div className="flex flex-col gap-4">
                {selectedUnits.map((ref, idx) => {
                  const detail = details.find(d => d._id === ref.learning_unit_id);
                  const isUnitCompleted = completedUnitIds.includes(ref.learning_unit_id);
                  return (
                    <button
                      type="button"
                      key={ref.learning_unit_id}
                      onClick={() => handleUnitClick(ref.learning_unit_id)}
                      className={`group flex flex-col text-left p-5 rounded-[16px] border transition-all duration-300 relative overflow-hidden cursor-pointer ${isUnitCompleted ? 'bg-[#f4f7f5] border-[#31583b] hover:shadow-[0_8px_24px_-8px_rgba(49,88,59,0.25)]' : 'bg-white border-[#eadfce] hover:border-[#c98a43] hover:shadow-[0_8px_24px_-8px_rgba(201,138,67,0.25)]'}`}
                      style={{ animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', animationDelay: `${idx * 75}ms`, opacity: 0 }}
                    >
                      {!isUnitCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#fff6eb] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      
                      <div className="relative z-10 flex items-start justify-between gap-4 w-full">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-serif text-[18px] font-bold transition-colors line-clamp-1 mb-1.5 ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#111111] group-hover:text-[#c98a43]'}`}>
                            {detail?.title || 'Neznana učna enota'}
                          </h4>
                          {detail?.short_description && (
                            <p className={`text-[14px] line-clamp-2 leading-relaxed ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#706b60]'}`}>
                              {detail.short_description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {!ref.is_required && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wide border ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#fff4e6] text-[#c98a43] border-[#f0d8bd]'}`}>
                                Izbirno
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wide bg-[#f4eee4] text-[#706b60]">
                              Stopnja {ref.order}
                            </span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 border shadow-sm mt-1 ${isUnitCompleted ? 'bg-[#31583b] border-[#31583b]' : 'bg-[#fcf9f2] group-hover:bg-[#c98a43] border-[#eadfce] group-hover:border-transparent'}`}>
                          {isUnitCompleted ? (
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                          ) : (
                            <ArrowRight className="w-5 h-5 text-[#a69c8f] group-hover:text-white transition-colors duration-300" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
