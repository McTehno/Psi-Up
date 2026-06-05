import {
  Award,
  Blocks,
  Bookmark,
  CheckCircle2,
  Clock,
  Heart,
  Info,
  LayoutPanelTop,
  Route,
} from 'lucide-react'

import {
  DetailHero,
  DetailMeta,
  DetailPageShell,
  DetailSection,
  DetailTags,
} from '../../components/detail'
import { appStyles } from '../../design'

function DetailTemplatePage() {
  return (
    <DetailPageShell>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className={appStyles.header.step}>
          <div className={appStyles.header.stepIcon}>
            <Route className="h-5 w-5" />
          </div>
          Detail template
        </div>

        <span className={appStyles.button.smallSecondary}>
          Predogled strukture
        </span>
      </div>

      <DetailHero
        eyebrow="Podrobnosti vsebine"
        title="Predloga za strani s podrobnostmi"
        description="Ta stran prikazuje skupno strukturo za detail strani. Posamezne strani naj ohranijo enak razpored, vsebina pa se prilagodi glede na tip podatkov."
      >
        <DetailMeta
          variant="compact"
          items={[
            {
              label: 'Meta podatek',
              value: 'Vrednost',
              icon: <Clock className="h-5 w-5" />,
            },
            {
              label: 'Meta podatek',
              value: 'Vrednost',
              icon: <Info className="h-5 w-5" />,
            },
            {
              label: 'Meta podatek',
              value: 'Vrednost',
              icon: <Award className="h-5 w-5" />,
            },
          ]}
        />

        <div className="mt-6">
          <DetailTags
            tags={['oznaka', 'primer', 'template']}
            emptyMessage="Ni dodanih oznak."
          />
        </div>
      </DetailHero>

      <DetailSection
        title="Osnovni podatki"
        description="Tukaj naj bodo prikazani najpomembnejši podatki o vsebini."
      >
        <div className="overflow-hidden rounded-[16px] border border-[#eadfce] bg-[#fffdf8]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Podatek',
                value: 'Vrednost podatka',
                icon: <Info className="h-5 w-5" />,
              },
              {
                label: 'Podatek',
                value: 'Vrednost podatka',
                icon: <Info className="h-5 w-5" />,
              },
              {
                label: 'Podatek',
                value: 'Vrednost podatka',
                icon: <Info className="h-5 w-5" />,
              },
              {
                label: 'Podatek',
                value: 'Vrednost podatka',
                icon: <Info className="h-5 w-5" />,
              },
            ].map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className={[
                  'flex min-w-0 items-start gap-4 px-5 py-5',
                  index !== 0
                    ? 'border-t border-[#eadfce] md:border-l md:border-t-0'
                    : '',
                  index === 2
                    ? 'md:border-l-0 md:border-t xl:border-l xl:border-t-0'
                    : '',
                ].join(' ')}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4eee4] text-[#31583b]">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-[#706b60]">
                    {item.label}
                  </p>

                  <strong className="mt-1.5 block text-[17px] font-bold leading-snug text-[#111111]">
                    {item.value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Glavna vsebina"
        description="Ta del je namenjen vsebinsko specifični komponenti posamezne strani."
      >
        <div className="rounded-[16px] border border-dashed border-[#d7c8b8] bg-[#fffdf8] px-6 py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4eee4] text-[#31583b]">
              <LayoutPanelTop className="h-6 w-6" />
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-[#d07a12]">
                Vsebinski okvir
              </p>

              <h3 className="mt-2 font-serif text-[28px] text-[#111111]">
                Tukaj pride specifična vsebina strani
              </h3>

              <p className="mt-2 max-w-[760px] text-[15px] leading-7 text-[#706b60]">
                Ta okvir naj sodelavci zamenjajo s svojo komponento, na primer
                vsebino za modul, učno pot, kompetenco ali drugo detail stran.
                Struktura strani ostane enaka, spreminja se samo ta notranji
                del.
              </p>

              <div className="mt-5 rounded-[14px] border border-[#eadfce] bg-[#fffaf5] px-5 py-4">
                <p className="font-mono text-[14px] leading-7 text-[#5d5a55]">
                  {'<SpecificDetailContent data={...} />'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DetailSection>

      <DetailSection
        title="Upravljanje vsebine"
        description="Primer prostora za akcije, ki se lahko pojavijo na detail strani."
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <Heart className="h-4 w-4 text-[#31583b]" />
            Primarna akcija
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <Bookmark className="h-4 w-4 text-[#31583b]" />
            Sekundarna akcija
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#eadfce] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-[#111111] transition hover:border-[#d07a12]/45 hover:bg-[#fff4e6]"
          >
            <CheckCircle2 className="h-4 w-4 text-[#31583b]" />
            Zaključi
          </button>
        </div>
      </DetailSection>

      <DetailSection
        title="Navodilo za uporabo predloge"
        description="Kratek opis, kako naj sodelavci uporabljajo to strukturo."
      >
        <div className="rounded-[16px] border border-[#eadfce] bg-[#fff6eb] px-6 py-5">
          <div className="flex gap-4">
            <Blocks className="mt-1 h-6 w-6 shrink-0 text-[#d07a12]" />

            <p className="text-[15px] leading-7 text-[#5d5a55]">
              Pri novih detail straneh naj ostanejo enaki deli: header, hero,
              osnovni podatki, glavna vsebina in upravljanje. Glavna vsebina se
              prilagodi glede na tip strani, zato se tukaj vstavi posebna
              komponenta za modul, učno pot, učno enoto ali drugo vsebino.
            </p>
          </div>
        </div>
      </DetailSection>
    </DetailPageShell>
  )
}

export default DetailTemplatePage

