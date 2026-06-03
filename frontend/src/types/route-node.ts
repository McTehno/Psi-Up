/**
 * Generični tipi za prikaz povezanih vsebin v detail straneh.
 *
 * Namen tega fila:
 * - omogočiti, da frontend ne razmišlja več samo v strukturi:
 *
 *   Learning path -> Module -> Learning unit
 *
 * - ampak lahko prikaže različne vrste vozlišč z isto komponento
 *
 * Primer:
 * - učna pot lahko vsebuje module
 * - modul lahko vsebuje učne enote
 * - učna pot lahko v prihodnosti vsebuje tudi učno enoto direktno kot vozlišče
 *
 * Kje se uporablja:
 * - src/utils/normalizers/detail-normalizers.ts
 * - src/components/detail/DetailRouteMap
 * - LearningPathDetailPage
 * - ModuleDetailPage
 *
 * Zakaj je to pomembno:
 * Če backend kasneje spremeni strukturo poti ali doda nov tip vsebine,
 * ne rabimo takoj pisati popolnoma nove UI komponente.
 * Dovolj je, da backend podatke pretvorimo v RouteNode obliko.
 */

/**
 * Tip vsebine, ki jo lahko prikažemo kot vozlišče v poti.
 *
 * Trenutno podpiramo:
 * - learning_path
 * - module
 * - learning_unit
 *
 * Če kasneje dodamo nov tip, ga dodamo tukaj.
 * Na primer:
 * - assessment
 * - resource
 * - quiz
 */
export type RouteNodeType = 'learning_path' | 'module' | 'learning_unit'

/**
 * Stabilna frontend oblika za eno vozlišče v poti.
 *
 * To ni nujno enako kot backend model.
 * To je poenostavljena oblika, ki jo UI zna varno prikazati.
 */
export type RouteNode = {
	/**
	 * ID vsebine.
	 *
	 * Uporablja se za:
	 * - React key
	 * - povezavo na detail stran
	 * - prepoznavanje vsebine
	 */
	id: string

	/**
	 * Tip vsebine.
	 *
	 * Na podlagi tega tipa frontend ve,
	 * na katero detail stran mora voditi povezava.
	 */
	type: RouteNodeType

	/**
	 * Naslov, ki ga prikažemo uporabniku.
	 *
	 * Vedno mora biti string.
	 * Če backend ne pošlje naslova, ga normalizer nadomesti s fallback tekstom.
	 */
	title: string

	/**
	 * Kratek opis vsebine.
	 *
	 * Opcijsko polje.
	 * Če ga ni, ga komponenta lahko ne prikaže.
	 */
	description?: string

	/**
	 * Trajanje v urah.
	 *
	 * Trenutna MongoDB struktura uporablja duration_hours.
	 */
	durationHours?: number

	/**
	 * Trajanje v minutah.
	 *
	 * Pustimo tudi to možnost, če backend kasneje doda duration_min.
	 */
	durationMin?: number

	/**
	 * Vrstni red znotraj poti ali modula.
	 *
	 * Opcijsko polje.
	 * Lahko se uporabi za sortiranje prikaza.
	 */
	order?: number

	/**
	 * Oznaka paralelne skupine.
	 *
	 * Primer:
	 * "excel_advanced_parallel"
	 *
	 * Uporabno za prikaz, da sta dva modula ali dve učni enoti
	 * na isti ravni oziroma se lahko izvajata vzporedno.
	 */
	parallelGroup?: string | null

	/**
	 * Ali je vozlišče obvezno.
	 *
	 * Če backend tega ne pošlje, ostane undefined.
	 */
	isRequired?: boolean

	/**
	 * Seznam ID-jev predpogojev.
	 *
	 * Primer:
	 * prerequisites: ["mod_003", "mod_004"]
	 */
	prerequisites: string[]
}