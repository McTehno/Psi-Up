import type React from 'react';
import type { LearningUnitReferenceResponse, LearningUnitResponse } from '../../../types/learning-unit';
import { BookOpen, Check } from 'lucide-react';

interface LearningUnitVisualizerProps {
  references: LearningUnitReferenceResponse[];
  details?: LearningUnitResponse[];
}

export const LearningUnitVisualizer: React.FC<LearningUnitVisualizerProps> = ({
  references,
  details = []
}) => {
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
            
            return (
              <div 
                key={order}
                className="absolute group z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${pos.y}px` }}
              >
                {/* Center Node */}
                <div 
                  className={`
                    w-[56px] h-[56px] rounded-full flex items-center justify-center bg-[#F2EDE1] 
                    border-[1.5px] border-[#DECFB3] relative z-20 shadow-sm
                    hover:ring-8 hover:ring-[#EACE9B]/40 transition-all duration-300
                  `}
                >
                  <BookOpen className="w-6 h-6 text-[#5c4d3c]" strokeWidth={2} />
                </div>
                
                {/* Floating Labels (Parallel Units container) */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-[260px] md:w-[280px] flex flex-col gap-3 ${pos.isRight ? 'left-[70px] md:left-[90px]' : 'right-[70px] md:right-[90px]'}`}
                >
                  <div className={`uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 ${pos.isRight ? 'text-left' : 'text-right'}`}>
                    Stopnja {i + 1}
                  </div>
                  
                  {units.map((ref) => {
                    const detail = details.find(d => d._id === ref.learning_unit_id);
                    return (
                      <div 
                        key={ref.learning_unit_id}
                        className={`bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#DECFB3] shadow-sm w-full transition-shadow hover:shadow-md ${pos.isRight ? 'text-left' : 'text-right'}`}
                      >
                        <h4 className="font-serif text-[1.1rem] font-bold text-[#5c3724] leading-tight mb-1">
                          {detail?.title || 'Neznana učna enota'}
                        </h4>
                        {detail?.short_description && (
                          <p className="text-xs text-[#64594c] line-clamp-2 mt-2 leading-relaxed">
                            {detail.short_description}
                          </p>
                        )}
                        {!ref.is_required && (
                          <span className="mt-3 inline-block px-2 py-1 bg-[#F5F0E8] border border-[#DECFB3] rounded text-[9px] uppercase font-bold text-[#A68D6A]">
                            Izbirno
                          </span>
                        )}
                      </div>
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
    </div>
  );
};
