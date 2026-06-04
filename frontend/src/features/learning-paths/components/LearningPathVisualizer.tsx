import React, { useState } from 'react';
import type { LearningPathData, Module } from '../../../types/domain';
import { Shield, BookOpen, Check } from 'lucide-react';
import { ModuleDetailsModal } from './ModuleDetailsModal';

interface LearningPathVisualizerProps {
  data: LearningPathData;
}

export const LearningPathVisualizer: React.FC<LearningPathVisualizerProps> = ({ data }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const modules = Array.isArray(data?.modules) ? data.modules : []
  const pathTitle = data?.pathTitle?.trim() || 'Neimenovana učna pot'
  const targetCompetency = data?.targetCompetency?.trim() || 'Ciljna kompetenca ni določena'
  const numNodes = modules.length

  // MAP CONSTANTS FOR MATHEMATICAL SINE CURVE
  const ROW_HEIGHT = 180;        // Vertical distance between nodes
  const SWING = 160;             // Horizontal distance from center curve peak
  const CENTER_X = 400;          // SVG Center
  const OFFSET_TOP = 80;         // Starting margin top of the first curve

  const finalGoalY = OFFSET_TOP + (numNodes * ROW_HEIGHT) + 60; // Final node directly on path bottom
  const totalHeight = finalGoalY + 120; // Full SVG canvas height padding

  // Generate the single smooth sine-wave SVG path mathematically
  let pathD = `M ${CENTER_X} 0`;
  let prevX = CENTER_X;
  let prevY = 0;

  const nodePositions: { x: number, y: number, isRight: boolean }[] = [];

  for (let i = 0; i < numNodes; i++) {
    const isRight = i % 2 === 0; // Starts with a right swing
    const targetX = isRight ? CENTER_X + SWING : CENTER_X - SWING;
    const targetY = OFFSET_TOP + (i * ROW_HEIGHT);

    nodePositions.push({ x: targetX, y: targetY, isRight });

    // Exact Cubic Bezier calculation for a continuous sinewave
    const cpY = (prevY + targetY) / 2;
    pathD += ` C ${prevX} ${cpY}, ${targetX} ${cpY}, ${targetX} ${targetY}`;

    prevX = targetX;
    prevY = targetY;
  }

  // Connect smoothly back to the center for the final graphical goal
  const cpY = (prevY + finalGoalY) / 2;
  pathD += ` C ${prevX} ${cpY}, ${CENTER_X} ${cpY}, ${CENTER_X} ${finalGoalY}`;

  return (
    <div className="relative w-full py-16 flex flex-col items-center">

      {/* Header aligned like desired photo */}
      <div className="mb-12 w-full max-w-4xl px-8 z-10 relative text-left">
        <span className="inline-flex items-center gap-2 bg-[#D1E0D7] text-[#33564A] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6 relative">
          <BookOpen className="w-3.5 h-3.5" />
          Primary goal
        </span>
        <h2 className="text-4xl md:text-5xl font-serif text-[#5c3724] font-bold mb-4 leading-tight">
          {pathTitle}
        </h2>
        <p className="text-[#64594c] text-lg max-w-2xl leading-relaxed">
          Sledite označeni poti za usvojitev osnovnih znanj in razumevanje vplivov analize ter strateškega načrtovanja. ({targetCompetency})
        </p>
      </div>
      {numNodes === 0 ? (
        <div className="w-full max-w-3xl rounded-[18px] border border-[#eadfce] bg-[#fffdf8] px-6 py-8 text-center shadow-[0_12px_28px_rgba(57,47,35,0.06)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#D1E0D7] text-[#33564A]">
            <BookOpen className="h-6 w-6" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#5c3724]">
            Moduli še niso dodani
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#706b60]">
            Ta učna pot trenutno še nima povezanih modulov.
          </p>
        </div>
      ) : (
        /* Mathematical canvas to hold SVG precisely matching HTML overlay grids via viewBox width=800 */
        <div className="relative w-full max-w-[800px] overflow-visible" style={{ height: `${totalHeight}px` }}>
          {/* Continuous single Gradient Line Path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 800 ${totalHeight}`}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <linearGradient id="main-path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                {/* This represents a beautiful unbroken transition across the whole path */}
                <stop offset="0%" stopColor="#7DAE8C" />
                <stop offset="60%" stopColor="#A4B98E" />
                <stop offset="100%" stopColor="#C4B491" />
              </linearGradient>
            </defs>

            <path
              d={pathD}
              fill="none"
              stroke="url(#main-path-gradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>

          {/* The Exact nodes anchored exactly to mathematical SVG map */}
          {modules.map((mod, i) => {
            const pos = nodePositions[i]

            if (!pos) {
              return null
            }

            const moduleId =
              typeof mod.id === 'string' && mod.id.trim()
                ? mod.id
                : `module-${i}`

            const moduleTitle =
              typeof mod.title === 'string' && mod.title.trim()
                ? mod.title
                : 'Neimenovan modul'

            const moduleOrder =
              typeof mod.order === 'number' && Number.isFinite(mod.order)
                ? mod.order
                : i + 1

            const isSelected = selectedModule?.id === mod.id

            return (
              <div
                key={moduleId}
                className="absolute group z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                /* We strictly position them according to the 800px coordinate map by percentages so it scales properly */
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${pos.y}px` }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`
                    w-[60px] h-[60px] rounded-full flex items-center justify-center bg-[#F2EDE1] 
                    border-[1.5px] border-[#DECFB3] cursor-pointer relative z-20
                    ${isSelected ? 'ring-8 ring-forest-600/20 shadow-md' : 'ring-8 ring-transparent hover:ring-[#EACE9B]/40 shadow-sm'}
                    transition-all duration-300
                  `}
                  aria-label={`Select ${moduleTitle}`}
                >
                  <Check className={`w-7 h-7 transition-colors duration-300 ${isSelected ? 'text-forest-700' : 'text-[#5c4d3c]'}`} strokeWidth={2} />
                </button>

                {/* Pure Floating labels strictly 90px away so they never overlap the node! */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-64 ${pos.isRight ? 'left-[90px] text-left' : 'right-[90px] text-right'}`}
                >
                  <div className="uppercase tracking-[0.2em] text-[#86968B] text-[10px] font-bold mb-1 opacity-90">
                    Mod. {moduleOrder}
                  </div>

                  <h4 className="font-serif text-[1.25rem] font-bold text-[#5c3724] leading-[1.3] group-hover:text-[#8c5233] transition-colors whitespace-normal">
                    {moduleTitle}
                  </h4>
                </div>
              </div>
            )
          })}

          {/* Re-connected Final Anchor Goal straight matching SVG mathematics */}
          <div
            className="absolute z-10 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '50%', top: `${finalGoalY}px` }}
          >
            <div className="w-[72px] h-[72px] bg-[#F2EDE1] rounded-full flex items-center justify-center p-1.5 z-20">
              <div className="w-full h-full bg-[#D5BE9E] rounded-full flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="absolute top-[80px] w-64 text-center">
              <h3 className="font-serif font-bold text-xl text-[#5c3724]">
                Cilj doseĹľen
              </h3>

              <p className="text-[#86968B] font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5">
                {targetCompetency}
              </p>
            </div>
          </div>
        </div>
      )}

      <ModuleDetailsModal
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </div >

  );
};

