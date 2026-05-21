function DetailTemplatePage() {
  return (
    <main className="min-h-screen bg-sand-50 px-6 py-12 text-brown-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-forest-600">
            Detail template
          </p>
          <h1 className="font-display text-4xl font-bold">
            Predloga za detail strani
          </h1>
          <p className="mt-4 max-w-3xl text-brown-600">
            Ta stran je referenca za prihodnje strani s podrobnostmi učne poti,
            modula in učne enote. Namenjena je samo dogovoru o strukturi, ne
            končnemu dizajnu.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold">Hero sekcija</h2>
          <p className="mt-2 text-brown-600">
            Tukaj bodo naslov, kratek opis, trajanje, ključne besede in osnovne
            akcije.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold">Pot vsebine</h2>
          <p className="mt-2 text-brown-600">
            Za učno pot bo tukaj prikaz modulov. Za modul bo tukaj prikaz učnih
            enot. Za učno enoto bodo tukaj lahko prikazane spretnosti ali
            vprašanja za samooceno.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold">Glavna vsebina</h2>
          <p className="mt-2 text-brown-600">
            Tukaj pridejo specifični podatki za izbrano vsebino.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold">Assistant</h2>
          <p className="mt-2 text-brown-600">
            Tukaj bo kasneje ponovno uporabljiv LLM chat za kontekst učne poti,
            modula ali učne enote.
          </p>
        </section>
      </div>
    </main>
  )
}

export default DetailTemplatePage