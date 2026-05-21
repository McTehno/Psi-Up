import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailRouteMap,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import { AssistantChat } from '../../features/assistant'

function DetailTemplatePage() {
  return (
    <DetailPageShell
      sidebar={
        <AssistantChat
          contextType="general"
          title="Pomočnik za detail stran"
        />
      }
    >
      <DetailHero
        eyebrow="Detail template"
        title="Predloga za detail strani"
        description="Ta stran prikazuje dogovorjeno strukturo za prihodnje strani s podrobnostmi učne poti, modula in učne enote."
      >
        <DetailMeta
          items={[
            { label: 'Tip strani', value: 'Template' },
            { label: 'Namen', value: 'Referenca' },
            { label: 'Status', value: 'Osnova' },
          ]}
        />
      </DetailHero>

      <DetailSection
        title="Ključne besede"
        description="Primer prikaza ključnih besed, ki se lahko uporabijo pri učni poti, modulu ali učni enoti."
      >
        <DetailTags
          tags={[
            'digitalne kompetence',
            'učna pot',
            'modul',
            'učna enota',
          ]}
        />
      </DetailSection>

      <DetailSection
        title="Pot vsebine"
        description="Za učno pot bodo tukaj prikazani moduli. Za modul bodo tukaj prikazane učne enote."
      >
        <DetailRouteMap
          items={[
            {
              id: 'step-1',
              title: 'Prvi korak',
              description: 'Primer prvega elementa v poti.',
              order: 1,
              isRequired: true,
              status: 'completed',
            },
            {
              id: 'step-2',
              title: 'Drugi korak',
              description: 'Primer trenutnega elementa v poti.',
              order: 2,
              isRequired: true,
              status: 'current',
            },
            {
              id: 'step-3',
              title: 'Tretji korak',
              description: 'Primer naslednjega elementa v poti.',
              order: 3,
              isRequired: false,
              status: 'available',
            },
          ]}
        />
      </DetailSection>

      <DetailSection
        title="Glavna vsebina"
        description="Tukaj bodo specifični podatki glede na tip vsebine."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-sand-50 p-4">
            <h3 className="font-semibold text-brown-900">Učna pot</h3>
            <p className="mt-2 text-sm text-brown-600">
              Prikazuje module, trajanje in priporočeno zaporedje.
            </p>
          </div>

          <div className="rounded-2xl bg-sand-50 p-4">
            <h3 className="font-semibold text-brown-900">Modul</h3>
            <p className="mt-2 text-sm text-brown-600">
              Prikazuje učne enote, pogoje in vrstni red.
            </p>
          </div>

          <div className="rounded-2xl bg-sand-50 p-4">
            <h3 className="font-semibold text-brown-900">Učna enota</h3>
            <p className="mt-2 text-sm text-brown-600">
              Prikazuje spretnosti in vprašanja za samooceno.
            </p>
          </div>
        </div>
      </DetailSection>
    </DetailPageShell>
  )
}

export default DetailTemplatePage