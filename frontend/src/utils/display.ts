/**
 * Utility funkcije za varen prikaz podatkov v uporabniškem vmesniku.
 *
 * Namen tega fila:
 * - poenotiti obravnavo manjkajočih, praznih ali neveljavnih vrednosti
 * - preprečiti napake, kadar backend vrne null, undefined ali prazne podatke
 * - zmanjšati podvajanje if stavkov po komponentah
 * - pripraviti frontend na bolj prilagodljivo backend JSON strukturo
 *
 * Kje se uporablja:
 * - v normalizerjih, ki backend response pretvorijo v frontend view model
 * - na detail straneh, kjer prikazujemo učne poti, module in učne enote
 * - v komponentah, ki morajo varno prikazati tekst, sezname ali številke
 *
 * Primer:
 * Namesto da v komponenti direktno uporabljamo:
 *
 * learningUnit.keywords.map(...)
 *
 * uporabimo:
 *
 * const keywords = getArrayOrEmpty(learningUnit.keywords)
 *
 * Tako se komponenta ne zlomi, če backend vrne null ali undefined.
 */

/**
 * Vrne tekst, če obstaja in ni prazen.
 * Če je vrednost null, undefined ali prazen string, vrne fallback.
 *
 * Uporaba:
 * - za obvezna UI polja, kjer želimo vedno nekaj prikazati
 * - na primer title ali description
 */
export const getTextOrFallback = (
	value: string | null | undefined,
	fallback = 'Ni podatka',
): string => {
	return value?.trim() ? value : fallback
}

/**
 * Vrne tekst, če obstaja in ni prazen.
 * Če vrednost ne obstaja, vrne null.
 *
 * Uporaba:
 * - za opcijska polja, ki jih želimo prikazati samo, če obstajajo
 * - na primer provider, language ali dodatni opis
 */
export const getOptionalText = (
	value: string | null | undefined,
): string | null => {
	return value?.trim() ? value : null
}

/**
 * Vrne array, če je vrednost res array.
 * Če je vrednost null, undefined ali napačnega tipa, vrne prazen array.
 *
 * Uporaba:
 * - za keywords
 * - za skills
 * - za modules
 * - za learning_units
 * - za katerikoli seznam iz backend-a
 */
export const getArrayOrEmpty = <T>(
	value: T[] | null | undefined,
): T[] => {
	return Array.isArray(value) ? value : []
}

/**
 * Preveri, ali array obstaja in ima vsaj en element.
 *
 * Uporaba:
 * - pred prikazom sekcij, ki nimajo smisla, če je seznam prazen
 * - na primer DetailTags, seznam modulov ali seznam učnih enot
 */
export const hasItems = <T>(
	value: T[] | null | undefined,
): value is T[] => {
	return Array.isArray(value) && value.length > 0
}

/**
 * Vrne številko, če je vrednost res number.
 * Če vrednost manjka ali ni številka, vrne undefined.
 *
 * Uporaba:
 * - za duration_min
 * - za order
 * - za druge opcijske številčne vrednosti
 */
export const getNumberOrUndefined = (
	value: number | null | undefined,
): number | undefined => {
	return typeof value === 'number' ? value : undefined
}