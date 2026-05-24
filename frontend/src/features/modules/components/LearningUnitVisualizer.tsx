import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { LearningUnitReferenceResponse, LearningUnitResponse } from '../../../types/learning-unit';
import { BookOpen, Check, ArrowRight, Award } from 'lucide-react';

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

  const handleUnitClick = (unitId: string) => {
    navigate(`/learning-units/${unitId}`);
  };

  const groupedUnits = references.reduce((acc, ref) => {
    const order = ref.order ?? 999;
    if (!acc[order]) {
      acc[order] = [];
    }
    acc[order].push(ref);
    return acc;
  }, {} as Record<number, LearningUnitReferenceResponse[]>);

  const sortedOrders = Object.keys(groupedUnits).map(Number).sort((a, b) => a - b);
  const numRows = sortedOrders.length;

  const SWING = 160;
  const CENTER_X = 400;
  const OFFSET_TOP = 80;

  const nodePositions: {
    unit: LearningUnitReferenceResponse;
    order: number;
    x: number;
    y: number;
    isSingle: boolean;
    isOnRightSide: boolean;
  }[] = [];

  let currentY = OFFSET_TOP;

  for (let i = 0; i < numRows; i++) {
    const order = sortedOrders[i];
    const units = groupedUnits[order];
    const numUnits = units.length;

    const isRightRow = i % 2 === 0;

    if (numUnits === 1) {
      nodePositions.push({
        unit: units[0],
        order,
        x: isRightRow ? CENTER_X + SWING : CENTER_X - SWING,
        y: currentY,
        isSingle: true,
        isOnRightSide: isRightRow
      });
      currentY += 200;
    } else if (numUnits === 2) {
      nodePositions.push({ unit: units[0], order, x: CENTER_X - 180, y: currentY, isSingle: false, isOnRightSide: false });
      nodePositions.push({ unit: units[1], order, x: CENTER_X + 180, y: currentY, isSingle: false, isOnRightSide: false });
      currentY += 320;
    } else {
      const spread = 560;
      for (let j = 0; j < numUnits; j++) {
        const x = CENTER_X - spread / 2 + (spread / (numUnits - 1)) * j;
        nodePositions.push({ unit: units[j], order, x, y: currentY, isSingle: false, isOnRightSide: false });
      }
      currentY += 320;
    }
  }

  const finalGoalY = numRows > 0 ? currentY + 40 : OFFSET_TOP + 100;
  const totalHeight = finalGoalY + 160;

  let paths: string[] = [];
  if (numRows > 0) {
    const firstRow = nodePositions.filter(n => n.order === sortedOrders[0]);
    for (const tgt of firstRow) {
      const cpY = tgt.y / 2;
      paths.push(`M ${CENTER_X} 0 C ${CENTER_X} ${cpY}, ${tgt.x} ${cpY}, ${tgt.x} ${tgt.y}`);
    }

    for (let i = 0; i < numRows - 1; i++) {
      const currOrder = sortedOrders[i];
      const nextOrder = sortedOrders[i + 1];
      const currNodes = nodePositions.filter(n => n.order === currOrder);
      const nextNodes = nodePositions.filter(n => n.order === nextOrder);

      for (const src of currNodes) {
        for (const tgt of nextNodes) {
          const cpY = (src.y + tgt.y) / 2;
          paths.push(`M ${src.x} ${src.y} C ${src.x} ${cpY}, ${tgt.x} ${cpY}, ${tgt.x} ${tgt.y}`);
        }
      }
    }

    const lastRow = nodePositions.filter(n => n.order === sortedOrders[numRows - 1]);
    for (const src of lastRow) {
      const cpY = (src.y + finalGoalY) / 2;
      paths.push(`M ${src.x} ${src.y} C ${src.x} ${cpY}, ${CENTER_X} ${cpY}, ${CENTER_X} ${finalGoalY}`);
    }
  } else {
    paths.push(`M ${CENTER_X} 0 L ${CENTER_X} ${finalGoalY}`);
  }

  const pathD = paths.join(' ');

  return (
    <div className="relative w-full py-8 flex flex-col items-center overflow-hidden">
      {numRows === 0 ? (
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

          {nodePositions.map((pos, idx) => {
            const ref = pos.unit;
            const detail = details.find(d => d._id === ref.learning_unit_id);
            const isUnitCompleted = completedUnitIds.includes(ref.learning_unit_id);

            return (
              <div
                key={`${ref.learning_unit_id}-${idx}`}
                className="absolute z-10 flex flex-col items-center justify-start transform -translate-x-1/2"
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${pos.y - 28}px` }}
              >
                {/* Center Node */}
                <button
                  type="button"
                  onClick={() => handleUnitClick(ref.learning_unit_id)}
                  className={`
                    w-[56px] h-[56px] shrink-0 rounded-full flex items-center justify-center relative z-20 shadow-sm cursor-pointer
                    hover:ring-8 transition-all duration-300
                    ${isUnitCompleted
                      ? 'bg-[#31583b] border border-[#31583b] hover:ring-[#31583b]/30 scale-105'
                      : 'bg-[#F2EDE1] border-[1.5px] border-[#DECFB3] hover:ring-[#EACE9B]/40 hover:scale-105 hover:bg-white'}
                  `}
                >
                  {isUnitCompleted ? (
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  ) : (
                    <BookOpen className="w-6 h-6 text-[#5c4d3c]" strokeWidth={2} />
                  )}
                </button>

                {/* Card */}
                {pos.isSingle ? (
                  <button
                    type="button"
                    onClick={() => handleUnitClick(ref.learning_unit_id)}
                    className={`absolute top-[28px] -translate-y-1/2 w-[240px] md:w-[260px] backdrop-blur-md p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-[calc(50%+4px)] cursor-pointer flex flex-col group/card ${pos.isOnRightSide ? 'left-[70px] md:left-[90px]' : 'right-[70px] md:right-[90px]'} ${isUnitCompleted ? 'bg-[#f4f7f5]/95 border-[#31583b] hover:border-[#31583b]' : 'bg-white/95 border-[#DECFB3] hover:border-[#C98A43]/50'}`}
                  >
                    <div className={`uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 mb-2 w-full ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                      Stopnja {ref.order}
                    </div>

                    <div className={`w-full flex items-start gap-2 ${pos.isOnRightSide ? 'justify-between' : 'justify-between flex-row-reverse'}`}>
                      <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 transition-colors ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#5c3724] group-hover/card:text-[#C98A43]'} ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                        {detail?.title || 'Neznana učna enota'}
                      </h4>
                      {isUnitCompleted ? (
                        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#31583b] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <ArrowRight className={`w-4 h-4 mt-1 text-[#C98A43] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex-shrink-0 ${pos.isOnRightSide ? '' : 'rotate-180'}`} />
                      )}
                    </div>
                    {detail?.short_description && (
                      <p className={`text-xs line-clamp-2 mt-1.5 leading-relaxed w-full ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'} ${pos.isOnRightSide ? 'text-left' : 'text-right'}`}>
                        {detail.short_description}
                      </p>
                    )}
                    {!ref.is_required && (
                      <span className={`mt-3 inline-block px-2 py-1 border rounded text-[9px] uppercase font-bold ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'} ${pos.isOnRightSide ? 'self-start' : 'self-end'}`}>
                        Izbirno
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUnitClick(ref.learning_unit_id)}
                    className={`mt-4 w-[240px] md:w-[260px] backdrop-blur-md p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col group/card text-left ${isUnitCompleted ? 'bg-[#f4f7f5]/95 border-[#31583b] hover:border-[#31583b]' : 'bg-white/95 border-[#DECFB3] hover:border-[#C98A43]/50'}`}
                  >
                    <div className="uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold opacity-90 mb-2">
                      Stopnja {ref.order}
                    </div>

                    <div className="w-full flex items-start justify-between gap-2">
                      <h4 className={`font-serif text-[1.1rem] font-bold leading-tight mb-1 transition-colors ${isUnitCompleted ? 'text-[#31583b]' : 'text-[#5c3724] group-hover/card:text-[#C98A43]'}`}>
                        {detail?.title || 'Neznana učna enota'}
                      </h4>
                      {isUnitCompleted ? (
                        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#31583b] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <ArrowRight className="w-4 h-4 mt-1 text-[#C98A43] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex-shrink-0" />
                      )}
                    </div>
                    {detail?.short_description && (
                      <p className={`text-xs line-clamp-2 mt-1.5 leading-relaxed ${isUnitCompleted ? 'text-[#4a6b53]' : 'text-[#64594c]'}`}>
                        {detail.short_description}
                      </p>
                    )}
                    {!ref.is_required && (
                      <span className={`mt-3 inline-block px-2 py-1 border rounded text-[9px] uppercase font-bold self-start ${isUnitCompleted ? 'bg-[#e9f2eb] border-[#31583b]/30 text-[#31583b]' : 'bg-[#F5F0E8] border-[#DECFB3] text-[#A68D6A]'}`}>
                        Izbirno
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}

          {/* Goal Node */}
          <div
            className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: '50%', top: `${finalGoalY}px` }}
          >
            {/* Main Node */}
            <div className="w-[72px] h-[72px] bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center p-2 z-20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#eadfce] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-gradient-to-br from-[#EACE9B] to-[#C98A43] rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Shine effect that moves on hover */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <Award className="w-8 h-8 text-white relative z-10 drop-shadow-md" strokeWidth={2.5} />
              </div>
            </div>

            {/* Badge Label */}
            <div className="mt-3 flex flex-col items-center z-20">
              <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-7 py-3 rounded-2xl border border-[#DECFB3] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-[#C98A43]/40">
                <div className="w-8 h-[1.5px] bg-gradient-to-r from-transparent to-[#C98A43]/60" />
                <h3 className="font-serif text-[1.15rem] font-bold text-[#5c3724] tracking-wide">
                  Konec modula
                </h3>
                <div className="w-8 h-[1.5px] bg-gradient-to-l from-transparent to-[#C98A43]/60" />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
