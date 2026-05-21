import { ClipboardList, Route } from 'lucide-react'
import mountainJourneyBg from '../../assets/mountain-journey-bg.png'

function DetailTemplatePage() {
  return (
    <main className="min-h-screen bg-[#e9e1d3] p-[18px] text-[#2f3328]">
      <div className="min-h-[calc(100vh-36px)] overflow-hidden rounded-[18px] border border-[#ded5c6] bg-[#fffdf8] shadow-[0_14px_40px_rgba(57,47,35,0.12)]">
        <section className="p-8 md:p-12 lg:p-[58px_72px_38px]">
          <div className="mb-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[18px] font-semibold text-[#706b60]">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f4eee4] text-[#344b35]">
                <Route className="h-5 w-5" />
              </div>
              Detail template
            </div>

            <span className="rounded-[10px] border border-[#ded5c6] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#706b60]">
              Predogled stila
            </span>
          </div>

          <section className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#706b60]">
              Podrobnosti vsebine
            </p>

            <h1 className="max-w-[860px] font-serif text-[44px] leading-[1.16] text-[#33442f]">
              Predloga za strani s podrobnostmi
            </h1>

            <p className="mt-4 max-w-[860px] text-[22px] leading-relaxed text-[#6f6a60]">
              Ta stran prikazuje, kako bi lahko izgledale strani za podrobnosti
              učne poti, modula in učne enote v istem vizualnem slogu kot
              vprašalnik.
            </p>
          </section>

          <section className="mb-8 rounded-[16px] border border-[#ded5c6] bg-[#fffdf8] p-6">
            <h2 className="mb-4 font-serif text-2xl text-[#33442f]">
              Osnovni podatki
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[12px] bg-[#f8f2e8] p-4">
                <span className="text-sm text-[#7b766c]">Tip</span>
                <strong className="mt-1 block text-[#2f4a31]">
                  Učna enota / Modul / Učna pot
                </strong>
              </div>

              <div className="rounded-[12px] bg-[#f8f2e8] p-4">
                <span className="text-sm text-[#7b766c]">Trajanje</span>
                <strong className="mt-1 block text-[#2f4a31]">25 min</strong>
              </div>

              <div className="rounded-[12px] bg-[#f8f2e8] p-4">
                <span className="text-sm text-[#7b766c]">Status</span>
                <strong className="mt-1 block text-[#2f4a31]">Na voljo</strong>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-[16px] border border-[#ded5c6] bg-[#fffdf8] p-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#706b60]">
                  Struktura učenja
                </p>

                <h2 className="font-serif text-3xl text-[#33442f]">
                  Pot vsebine
                </h2>

                <p className="mt-2 max-w-[760px] text-[#6f6a60]">
                  Pri učni poti bodo tukaj prikazani moduli. Pri modulu bodo
                  tukaj prikazane učne enote. Prikaz bo vizualen, zato uporabnik
                  lažje razume zaporedje in napredovanje.
                </p>
              </div>
            </div>

            <div
              className="relative min-h-[560px] overflow-hidden rounded-[24px] border border-[rgba(47,74,49,0.12)] bg-[#f7f1e6] md:min-h-[620px] lg:min-h-[680px]"
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
              {[
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
              ].map((item) => (
                <button
                  key={item.number}
                  type="button"
                  className="absolute z-10 max-w-[220px] translate-x-[-23px] translate-y-[-23px] text-left text-[#2f4a31] transition hover:translate-y-[-27px]"
                  style={{
                    left: item.left,
                    top: item.top,
                  }}
                >
                  <span className="mb-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[rgba(47,74,49,0.18)] bg-[#fffaf2] text-[22px] font-bold text-[#2f4a31] shadow-[0_6px_18px_rgba(47,74,49,0.18)]">
                    {item.number}
                  </span>

                  <strong className="block text-[20px] leading-[1.15]">
                    {item.title}
                  </strong>

                  <p className="mt-1 text-sm leading-[1.35] text-[#4f594d]">
                    {item.status}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[16px] border border-[#ded5c6] bg-[#fffdf8] p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-[#33442f]">
                  Preveri predznanje
                </h2>

                <p className="mt-2 max-w-[720px] text-[#6f6a60]">
                  Uporabnik lahko pred začetkom odpre vprašalnik, da sistem
                  oceni, kje naj začne in katere dele lahko preskoči.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#31583b] bg-[#31583b] px-6 py-4 text-[18px] font-bold text-white transition hover:bg-[#2a4d33]"
              >
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