import { ClipboardList, Route } from 'lucide-react'
import mountainJourneyBg from '../../assets/mountain-journey-bg.png'
import { appStyles } from '../../design'

function DetailTemplatePage() {
  const demoJourneySteps = [
    {
      number: 1,
      title: 'Začetek',
      left: '18%',
      top: '68%',
      status: 'Opravljeno',
    },
    {
      number: 2,
      title: 'Trenutni korak',
      left: '44%',
      top: '48%',
      status: 'Trenutno',
    },
    {
      number: 3,
      title: 'Naslednji korak',
      left: '70%',
      top: '30%',
      status: 'Na voljo',
    },
  ]

  return (
    <main className={appStyles.page.base}>
      <div className={appStyles.layout.fullWidthPanel}>
        <section className={appStyles.page.content}>
          <div className={appStyles.header.row}>
            <div className={appStyles.header.step}>
              <div className={appStyles.header.stepIcon}>
                <Route className="h-5 w-5" />
              </div>
              Detail template
            </div>

            <span className={appStyles.button.smallSecondary}>
              Predogled stila
            </span>
          </div>

          <section className="mb-10">
            <p className={`mb-3 ${appStyles.text.eyebrow}`}>
              Podrobnosti vsebine
            </p>

            <h1 className={`max-w-[860px] ${appStyles.text.pageTitle}`}>
              Predloga za strani s podrobnostmi
            </h1>

            <p className={`mt-4 max-w-[860px] ${appStyles.text.bodyLarge}`}>
              Ta stran prikazuje, kako bi lahko izgledale strani za podrobnosti
              učne poti, modula in učne enote v istem vizualnem slogu kot
              vprašalnik.
            </p>
          </section>

          <section className={`mb-8 ${appStyles.card.base}`}>
            <h2 className={`mb-4 ${appStyles.text.sectionTitle}`}>
              Osnovni podatki
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className={appStyles.card.soft}>
                <span className="text-sm text-[#7b766c]">Tip</span>
                <strong className={`mt-1 block ${appStyles.text.green}`}>
                  Učna enota / Modul / Učna pot
                </strong>
              </div>

              <div className={appStyles.card.soft}>
                <span className="text-sm text-[#7b766c]">Trajanje</span>
                <strong className={`mt-1 block ${appStyles.text.green}`}>
                  25 min
                </strong>
              </div>

              <div className={appStyles.card.soft}>
                <span className="text-sm text-[#7b766c]">Status</span>
                <strong className={`mt-1 block ${appStyles.text.green}`}>
                  Na voljo
                </strong>
              </div>
            </div>
          </section>

          <section className={`mb-8 ${appStyles.card.base}`}>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={`mb-2 ${appStyles.text.eyebrow}`}>
                  Struktura učenja
                </p>

                <h2 className="font-serif text-3xl text-[#33442f]">
                  Pot vsebine
                </h2>

                <p className={`mt-2 max-w-[760px] ${appStyles.text.body}`}>
                  Pri učni poti bodo tukaj prikazani moduli. Pri modulu bodo
                  tukaj prikazane učne enote. Prikaz bo vizualen, zato uporabnik
                  lažje razume zaporedje in napredovanje.
                </p>
              </div>
            </div>

            <div
              className={appStyles.journey.mountain}
              style={{
                backgroundImage: `linear-gradient(
                  to bottom,
                  rgba(255, 250, 242, 0.08),
                  rgba(255, 250, 242, 0.32)
                ), url(${mountainJourneyBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 18%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {demoJourneySteps.map((item) => (
                <button
                  key={item.number}
                  type="button"
                  className={appStyles.journey.step}
                  style={{
                    left: item.left,
                    top: item.top,
                  }}
                >
                  <span className={appStyles.journey.stepMarker}>
                    {item.number}
                  </span>

                  <strong className={appStyles.journey.stepTitle}>
                    {item.title}
                  </strong>

                  <p className={appStyles.journey.stepDescription}>
                    {item.status}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className={appStyles.card.base}>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className={appStyles.text.sectionTitle}>
                  Preveri predznanje
                </h2>

                <p className={`mt-2 max-w-[720px] ${appStyles.text.body}`}>
                  Uporabnik lahko pred začetkom odpre vprašalnik, da sistem
                  oceni, kje naj začne in katere dele lahko preskoči.
                </p>
              </div>

              <button type="button" className={appStyles.button.primary}>
                <ClipboardList className="h-5 w-5" />
                Odpri vprašalnik
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

export default DetailTemplatePage