import { useState } from 'react'
import { LearningPathMountain } from '../../features/learning-paths/components/LearningPathMountain'
import type { LearningPathData } from '../../types/domain'
import { CollapsibleChatPanel } from '../../components/layout/ChatPanel/CollapsibleChatPanel'

const mockLearningPath: LearningPathData = {
  pathTitle: 'Kibernetska varnost in odgovorno delo',
  pathDescription:
    'Učna pot za zagotavljanje varnega sodelovanja in obveščanje o digitalni zasebnosti.',
  targetCompetency: 'Varnost in odgovorna raba (DigComp)',
  modules: [
    {
      id: 'mod_11',
      order: 1,
      title: 'Kibernetska varnost za končne uporabnike',
      description:
        'Zavedanje o tveganjih, socialni inženiring in upravljanje gesel.',
      learningUnitsCount: 6,
    },
    {
      id: 'mod_13',
      order: 2,
      title: 'Digitalna identiteta in zasebnost',
      description:
        'Varovanje osebnih podatkov in nastavitve zasebnosti na spletu.',
      learningUnitsCount: 6,
    },
    {
      id: 'mod_14',
      order: 3,
      title: 'Prepoznavanje zlonamerne programske opreme',
      description:
        'Identifikacija groženj in pravilno ukrepanje ob incidentih.',
      learningUnitsCount: 6,
    },
    {
      id: 'mod_12',
      order: 4,
      title: 'Varno deljenje in zaščita podatkov',
      description:
        'Enkripcija in varna distribucija občutljivih datotek.',
      learningUnitsCount: 6,
    },
    {
      id: 'mod_4',
      order: 5,
      title: 'Komunikacija in sodelovanje na daljavo',
      description:
        'Osnove uporabe Teams in deljenja datotek.',
      learningUnitsCount: 6,
    },
  ],
}

function LearningPathDetailPage() {
  const [isChatPanelExpanded, setIsChatPanelExpanded] = useState(false)
  return (
    <main className="min-h-screen bg-[#F7F1E6] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto h-[calc(100vh-7.5rem)] min-h-[720px] max-w-[1800px]">
        <div
          className={`h-full transition-[width] duration-300 ease-out ${
            isChatPanelExpanded ? 'w-[calc(100%-384px)]' : 'w-full'
          }`}
        >
          <LearningPathMountain data={mockLearningPath} className="h-full" />
        </div>

        <CollapsibleChatPanel
          title="Chat pride kasneje"
          description="Ta prostor je rezerviran za pogovor z asistentom. Za zdaj je fokus na prikazu učne poti in povezavah do učnih enot."
          footerText="Kasneje lahko tukaj dodamo vprašanja o trenutni učni poti, priporočila in pomoč pri posameznih učnih enotah."
          onExpandedChange={setIsChatPanelExpanded}
        />
      </div>
    </main>
  )
}

export default LearningPathDetailPage