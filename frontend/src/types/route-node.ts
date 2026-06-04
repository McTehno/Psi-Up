/**
 * GeneriÄŤni tipi za prikaz povezanih vsebin v detail straneh.
 *
 * Namen tega fila:
 * - omogoÄŤiti, da frontend ne razmiĹˇlja veÄŤ samo v strukturi:
 *
 *   Learning path -> Module -> Learning unit
 *
 * - ampak lahko prikaĹľe razliÄŤne vrste vozliĹˇÄŤ z isto komponento
 *
 * Primer:
 * - uÄŤna pot lahko vsebuje module
 * - modul lahko vsebuje uÄŤne enote
 * - uÄŤna pot lahko v prihodnosti vsebuje tudi uÄŤno enoto direktno kot vozliĹˇÄŤe
 *
 * Kje se uporablja:
 * - src/utils/normalizers/detail-normalizers.ts
 * - src/components/detail/DetailRouteMap
 * - LearningPathDetailPage
 * - ModuleDetailPage
 *
 * Zakaj je to pomembno:
 * ÄŚe backend kasneje spremeni strukturo poti ali doda nov tip vsebine,
 * ne rabimo takoj pisati popolnoma nove UI komponente.
 * Dovolj je, da backend podatke pretvorimo v RouteNode obliko.
 */

/**
 * Tip vsebine, ki jo lahko prikaĹľemo kot vozliĹˇÄŤe v poti.
 *
 * Trenutno podpiramo:
 * - learning_path
 * - module
 * - learning_unit
 *
 * ÄŚe kasneje dodamo nov tip, ga dodamo tukaj.
 * Na primer:
 * - assessment
 * - resource
 * - quiz
 */
export type RouteNodeType = 'learning_path' | 'module' | 'learning_unit'

/**
 * Stabilna frontend oblika za eno vozliĹˇÄŤe v poti.
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
	 * Naslov, ki ga prikaĹľemo uporabniku.
	 *
	 * Vedno mora biti string.
	 * ÄŚe backend ne poĹˇlje naslova, ga normalizer nadomesti s fallback tekstom.
	 */
	title: string

	/**
	 * Kratek opis vsebine.
	 *
	 * Opcijsko polje.
	 * ÄŚe ga ni, ga komponenta lahko ne prikaĹľe.
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
	 * Pustimo tudi to moĹľnost, ÄŤe backend kasneje doda duration_min.
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
	 * Uporabno za prikaz, da sta dva modula ali dve uÄŤni enoti
	 * na isti ravni oziroma se lahko izvajata vzporedno.
	 */
	parallelGroup?: string | null

	/**
	 * Ali je vozliĹˇÄŤe obvezno.
	 *
	 * ÄŚe backend tega ne poĹˇlje, ostane undefined.
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

