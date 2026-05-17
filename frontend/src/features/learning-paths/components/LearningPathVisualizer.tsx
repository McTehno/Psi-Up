import React, { useState } from 'react';
import type { LearningPathData, Module } from '../../../types/domain';
import { ModuleNode } from './ModuleNode';

interface LearningPathVisualizerProps {
  data: LearningPathData;
}

export const LearningPathVisualizer: React.FC<LearningPathVisualizerProps> = ({ data }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
  };

  return (
    <div className="relative w-full py-16 flex flex-col items-center min-h-[800px] overflow-visible">
      
      {/* Target Competency Header matching the styling of the photo */}
      <div className="mb-12 w-full max-w-4xl px-8 z-10 relative text-left">
        <span className="inline-flex items-center gap-2 bg-[#D1E0D7] text-[#33564A] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 relative">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
          Glavni cilj
        </span>
        <h2 className="text-4xl md:text-5xl font-serif text-[#5c3724] font-bold mb-4 leading-tight">
          {data.pathTitle}
        </h2>
        <p className="text-[#64594c] text-lg max-w-2xl leading-relaxed">
          Sledite označeni poti za usvojitev osnovnih znanj in razumevanje vplivov analize ter strateškega načrtovanja. ({data.targetCompetency})
        </p>
      </div>

      <div className="relative w-full max-w-4xl flex flex-col py-6 overflow-visible">
        {/* Render each node cleanly. We alternate left and right curves. */}
        <div className="flex flex-col relative z-10 w-full overflow-visible space-y-[-1px]">
          {data.modules.map((mod, index) => (
            <ModuleNode 
              key={mod.id} 
              module={mod} 
              isLeft={index % 2 !== 0} // e.g. first node on the right, second on the left
              isSelected={selectedModule?.id === mod.id}
              onClick={handleModuleClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

