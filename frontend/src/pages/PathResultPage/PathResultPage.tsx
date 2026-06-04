import React from 'react';
import { useLocation } from 'react-router-dom';
import type { LearningPathData } from '../../types/domain';
import { LearningPathVisualizer } from '../../features/learning-paths/components/LearningPathVisualizer';
import { Download, Bookmark, Share2 } from 'lucide-react';



const mockData: LearningPathData = {
  pathTitle: "Kibernetska varnost in odgovorno delo",
  pathDescription: "Učna pot za zagotavljanje varnega sodelovanja in obveščanje o digitalni zasebnosti.",
  targetCompetency: "Varnost in odgovorna raba (DigComp)",
  modules: [
    {
      id: "mod_11",
      order: 1,
      title: "Kibernetska varnost za končne uporabnike",
      description: "Zavedanje o tveganjih, socialni inĹľeniring in upravljanje gesel.",
      learningUnitsCount: 6
    },
    {
      id: "mod_13",
      order: 2,
      title: "Digitalna identiteta in zasebnost",
      description: "Varovanje osebnih podatkov in nastavitve zasebnosti na spletu.",
      learningUnitsCount: 6
    },
    {
      id: "mod_14",
      order: 3,
      title: "Prepoznavanje zlonamerne programske opreme",
      description: "Identifikacija groĹľenj in pravilno ukrepanje ob incidentih.",
      learningUnitsCount: 6
    },
    {
      id: "mod_12",
      order: 4,
      title: "Varno deljenje in zaščita podatkov",
      description: "Enkripcija in varna distribucija občutljivih datotek.",
      learningUnitsCount: 6
    },
    {
      id: "mod_4",
      order: 5,
      title: "Komunikacija in sodelovanje na daljavo",
      description: "Osnove uporabe Teams in deljenja datotek.",
      learningUnitsCount: 6
    }
  ]
};

export const PathResultPage: React.FC = () => {
  const location = useLocation();
  const learningPathResponse = location.state?.learningPath;

  const data: LearningPathData = learningPathResponse ? {
    pathTitle: learningPathResponse.title,
    pathDescription: learningPathResponse.description,
    targetCompetency: learningPathResponse.competency_id,
    modules: learningPathResponse.modules.map((m: { id: string, title: string, description: string, learning_units: unknown[] }, idx: number) => ({
      id: m.id,
      order: idx + 1,
      title: m.title,
      description: m.description,
      learningUnitsCount: m.learning_units?.length || 0
    }))
  } : mockData;

  return (
    <div className="min-h-screen text-[#3E2723] flex flex-col md:flex-row font-sans overflow-x-hidden">
      
      {/* Sidebar - Left Column */}
      <aside className="w-full md:w-1/4 border-r border-brown-200/60 p-6 lg:p-10 flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Vaša učna pot</h1>
          <p className="text-slate-600 text-sm">Personalizirano na podlagi vaših rezultatov ocenjevanja.</p>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Orodja</h2>
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white transition-colors text-left font-medium border border-transparent hover:border-brown-200/40 hover:shadow-sm">
            <Download className="w-5 h-5 text-forest-600" />
            Izvozi PDF
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white transition-colors text-left font-medium border border-transparent hover:border-brown-200/40 hover:shadow-sm">
            <Bookmark className="w-5 h-5 text-orange-600" />
            Shrani pot
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white transition-colors text-left font-medium border border-transparent hover:border-brown-200/40 hover:shadow-sm">
            <Share2 className="w-5 h-5 text-blue-600" />
            Deli pot
          </button>
        </div>
      </aside>

      {/* Main Content - Right Column */}
      <main className="w-full md:w-3/4 relative flex justify-center overflow-x-hidden">
        <LearningPathVisualizer data={data} />
      </main>

    </div>
  );
};

export default PathResultPage;


