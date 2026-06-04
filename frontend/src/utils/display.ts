/**
 * Utility funkcije za varen prikaz podatkov v uporabniĹˇkem vmesniku.
 *
 * Namen tega fila:
 * - poenotiti obravnavo manjkajoÄŤih, praznih ali neveljavnih vrednosti
 * - prepreÄŤiti napake, kadar backend vrne null, undefined ali prazne podatke
 * - zmanjĹˇati podvajanje if stavkov po komponentah
 * - pripraviti frontend na bolj prilagodljivo backend JSON strukturo
 *
 * Kje se uporablja:
 * - v normalizerjih, ki backend response pretvorijo v frontend view model
 * - na detail straneh, kjer prikazujemo uÄŤne poti, module in uÄŤne enote
 * - v komponentah, ki morajo varno prikazati tekst, sezname ali Ĺˇtevilke
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
 * Tako se komponenta ne zlomi, ÄŤe backend vrne null ali undefined.
 */

/**
 * Vrne tekst, ÄŤe obstaja in ni prazen.
 * ÄŚe je vrednost null, undefined ali prazen string, vrne fallback.
 *
 * Uporaba:
 * - za obvezna UI polja, kjer Ĺľelimo vedno nekaj prikazati
 * - na primer title ali description
 */
export const getTextOrFallback = (
	value: string | null | undefined,
	fallback = 'Ni podatka',
): string => {
	return value?.trim() ? value : fallback
}

/**
 * Vrne tekst, ÄŤe obstaja in ni prazen.
 * ÄŚe vrednost ne obstaja, vrne null.
 *
 * Uporaba:
 * - za opcijska polja, ki jih Ĺľelimo prikazati samo, ÄŤe obstajajo
 * - na primer provider, language ali dodatni opis
 */
export const getOptionalText = (
	value: string | null | undefined,
): string | null => {
	return value?.trim() ? value : null
}

/**
 * Vrne array, ÄŤe je vrednost res array.
 * ÄŚe je vrednost null, undefined ali napaÄŤnega tipa, vrne prazen array.
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
 * - pred prikazom sekcij, ki nimajo smisla, ÄŤe je seznam prazen
 * - na primer DetailTags, seznam modulov ali seznam uÄŤnih enot
 */
export const hasItems = <T>(
	value: T[] | null | undefined,
): value is T[] => {
	return Array.isArray(value) && value.length > 0
}

/**
 * Vrne Ĺˇtevilko, ÄŤe je vrednost res number.
 * ÄŚe vrednost manjka ali ni Ĺˇtevilka, vrne undefined.
 *
 * Uporaba:
 * - za duration_min
 * - za order
 * - za druge opcijske ĹˇtevilÄŤne vrednosti
 */
export const getNumberOrUndefined = (
	value: number | null | undefined,
): number | undefined => {
	return typeof value === 'number' ? value : undefined
}

