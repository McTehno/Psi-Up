/**
 * Normalizerji za detail strani.
 *
 * Namen tega fila:
 * - pretvoriti backend response v stabilno frontend obliko
 * - zaščititi UI pred manjkajočimi, null ali nepopolnimi podatki
 * - podpreti trenutno MongoDB strukturo projekta NIDiKo
 * - podpreti dodatna znana polja, če jih backend vrne
 * - preprečiti, da bi komponente direktno brale nestabilno backend strukturo
 *
 * Kje se uporablja:
 * - LearningPathDetailPage
 * - ModuleDetailPage
 * - LearningUnitDetailPage
 * - DetailRouteMap
 *
 * Trenutna backend struktura:
 *
 * Learning path:
 * - _id
 * - title
 * - short_description
 * - duration_hours
 * - keywords
 * - modules: [{ module_id, order, parallel_group, is_required, prerequisites }]
 *
 * Module:
 * - _id
 * - title
 * - short_description
 * - duration_hours
 * - keywords
 * - domains
 * - learning_units: [{ learning_unit_id, order, parallel_group, is_required, prerequisites }]
 *
 * Learning unit:
 * - _id
 * - title
 * - short_description
 * - duration_hours
 * - keywords
 * - content_topics
 * - acquired_competencies
 * - digcomp_competencies
 * - delivery_mode
 * - provider
 * - target_audience
 * - prerequisites
 * - knowledge_assessment
 * - certificate
 * - self_assessment_questions
 *
 * Glavna ideja:
 * Backend lahko vrne različne oblike podatkov.
 * UI pa naj vedno dobi stabilno obliko, ki jo zna varno prikazati.
 */

import type { RouteNode } from '../../types/route-node'
import {
	getArrayOrEmpty,
	getNumberOrUndefined,
	getOptionalText,
	getTextOrFallback,
} from '../display'

/**
 * Splošna surova oblika detail podatkov.
 *
 * Namenoma dovolimo dodatna polja z:
 *
 * [key: string]&#58; unknown
 *
 * To pomeni, da frontend sprejme tudi backend polja,
 * ki jih trenutno še ne poznamo.
 *
 * Pomembno:
 * Neznanih polj ne prikazujemo avtomatsko.
 * Prikažemo samo tista, ki so dovoljena v EXTRA_FIELD_LABELS.
 */
export type RawDetailContent = {
	id?: string | null
	_id?: string | null

	module_id?: string | null
	learning_unit_id?: string | null
	learning_path_id?: string | null

	title?: string | null
	name?: string | null
	short_description?: string | null
	description?: string | null

	duration_min?: number | null
	duration_hours?: number | null

	keywords?: string[] | null
	order?: number | null

	parallel_group?: string | null
	is_required?: boolean | null
	prerequisites?: string[] | null

	[key: string]: unknown
}

/**
 * Stabilna frontend oblika za detail vsebino.
 *
 * To je oblika, ki jo uporabljajo UI komponente.
 * Komponente zato ne rabijo preverjati vseh možnih backend primerov.
 */
export type DetailContentViewModel = {
	id: string
	title: string
	description: string
	durationHours?: number
	durationMin?: number
	keywords: string[]
	extraFields: DetailExtraField[]
}

/**
 * Oblika dodatnega polja, ki ga lahko prikažemo v UI.
 *
 * Primer:
 * {
 *   label: 'Izvajalec',
 *   value: 'Šolski center Kungota'
 * }
 */
export type DetailExtraField = {
	label: string
	value: string
}

/**
 * Dovoljena dodatna polja za prikaz.
 *
 * Zakaj uporabljamo allowlist:
 * Backend lahko vrne tudi tehnična polja, na primer:
 * - embedding
 * - internal_score
 * - created_at
 * - updated_at
 * - debug
 *
 * Teh polj ne želimo avtomatsko prikazati uporabniku.
 * Zato prikažemo samo polja, ki jih tukaj eksplicitno dovolimo.
 */
const EXTRA_FIELD_LABELS: Record<string, string> = {
	provider: 'Izvajalec',
	delivery_mode: 'Način izvedbe',
	target_audience: 'Ciljna skupina',
	knowledge_assessment: 'Preverjanje znanja',
	certificate: 'Certifikat',
	certificate_available: 'Certifikat',
	difficulty: 'Zahtevnost',
	language: 'Jezik',
}

/**
 * Lepši prikaz znanih tehničnih vrednosti.
 *
 * Če backend vrne difficulty: "beginner",
 * uporabniku raje pokažemo "Začetna".
 */
const DIFFICULTY_LABELS: Record<string, string> = {
	beginner: 'Začetna',
	intermediate: 'Srednja',
	advanced: 'Napredna',
}

/**
 * Vrne stabilen ID iz backend objekta.
 *
 * Podpiramo:
 * - id
 * - _id
 * - module_id
 * - learning_unit_id
 * - learning_path_id
 *
 * Zakaj:
 * MongoDB dokumenti uporabljajo _id.
 * Reference znotraj learning path / module pa uporabljajo module_id ali learning_unit_id.
 */
export const normalizeContentId = (content: RawDetailContent): string => {
	return String(
		content.id ??
			content._id ??
			content.module_id ??
			content.learning_unit_id ??
			content.learning_path_id ??
			'',
	)
}

/**
 * Vrne stabilen naslov vsebine.
 *
 * Podpiramo:
 * - title
 * - name
 *
 * Če naslov manjka, uporabimo fallback.
 *
 * Pri referencah, kot je:
 * { module_id: "mod_003", order: 1 }
 *
 * naslov ne obstaja, zato bo prikazan fallback.
 */
export const normalizeContentTitle = (
	content: RawDetailContent,
	fallback: string,
): string => {
	return getTextOrFallback(content.title ?? content.name, fallback)
}

/**
 * Vrne stabilen opis vsebine.
 *
 * Podpiramo:
 * - short_description
 * - description
 *
 * Če opis manjka, vrnemo prazen string.
 *
 * Zakaj prazen string?
 * Pri referencah v modules / learning_units pogosto nimamo opisa.
 * Bolje je, da komponenta opisa ne prikaže, kot da za vsako referenco pokaže:
 * "Opis trenutno ni na voljo."
 */
export const normalizeContentDescription = (
	content: RawDetailContent,
	fallback = '',
): string => {
	return getTextOrFallback(
		content.short_description ?? content.description,
		fallback,
	)
}

/**
 * Vrne stabilen seznam ključnih besed.
 *
 * Če backend vrne null, undefined ali napačno vrednost,
 * funkcija vrne prazen array.
 */
export const normalizeKeywords = (content: RawDetailContent): string[] => {
	return getArrayOrEmpty(content.keywords)
}

/**
 * Vrne trajanje v urah.
 *
 * Trenutna MongoDB struktura uporablja duration_hours.
 */
export const normalizeDurationHours = (
	content: RawDetailContent,
): number | undefined => {
	return getNumberOrUndefined(content.duration_hours)
}

/**
 * Vrne trajanje v minutah.
 *
 * To pustimo zaradi možne prihodnje podpore,
 * če backend kasneje doda duration_min.
 */
export const normalizeDurationMin = (
	content: RawDetailContent,
): number | undefined => {
	return getNumberOrUndefined(content.duration_min)
}

/**
 * Formatira vrednost dodatnega polja za prikaz v UI.
 *
 * Podpiramo:
 * - string
 * - number
 * - boolean
 *
 * Objektov in array-ev za zdaj ne prikazujemo v extraFields,
 * ker bi lahko povzročili nečitljiv ali preobremenjen UI.
 *
 * Za sezname, kot so:
 * - content_topics
 * - acquired_competencies
 * - prerequisites
 *
 * je boljše narediti ločene DetailSection prikaze.
 */
const formatExtraFieldValue = (
	fieldName: string,
	value: unknown,
): string | null => {
	if (fieldName === 'difficulty' && typeof value === 'string') {
		return DIFFICULTY_LABELS[value] ?? value
	}

	if (typeof value === 'string') {
		return getOptionalText(value)
	}

	if (typeof value === 'number') {
		return String(value)
	}

	if (typeof value === 'boolean') {
		return value ? 'Da' : 'Ne'
	}

	return null
}

/**
 * Normalizira dodatna znana polja.
 *
 * Funkcija pregleda samo polja iz EXTRA_FIELD_LABELS.
 * Če polje obstaja in ima uporabno vrednost, ga doda v extraFields.
 *
 * Neznana backend polja se ignorirajo.
 */
export const normalizeExtraFields = (
	content: RawDetailContent,
): DetailExtraField[] => {
	return Object.entries(EXTRA_FIELD_LABELS)
		.map(([fieldName, label]) => {
			const value = formatExtraFieldValue(fieldName, content[fieldName])

			if (!value) {
				return null
			}

			return {
				label,
				value,
			}
		})
		.filter((field): field is DetailExtraField => field !== null)
}

/**
 * Glavni normalizer za detail vsebino.
 *
 * To funkcijo uporabimo, kadar želimo backend objekt pretvoriti
 * v stabilno obliko za prikaz na detail strani.
 */
export const normalizeDetailContent = (
	content: RawDetailContent,
	fallbackTitle: string,
): DetailContentViewModel => {
	return {
		id: normalizeContentId(content),
		title: normalizeContentTitle(content, fallbackTitle),
		description: normalizeContentDescription(
			content,
			'Opis trenutno ni na voljo.',
		),
		durationHours: normalizeDurationHours(content),
		durationMin: normalizeDurationMin(content),
		keywords: normalizeKeywords(content),
		extraFields: normalizeExtraFields(content),
	}
}

/**
 * Normalizira eno vsebino v RouteNode.
 *
 * RouteNode je generična oblika za prikaz povezane vsebine
 * znotraj DetailRouteMap komponente.
 *
 * Primeri:
 * - modul znotraj učne poti
 * - učna enota znotraj modula
 * - učna enota direktno znotraj učne poti
 *
 * Ta funkcija podpira tudi referenčne objekte:
 *
 * {
 *   module_id: "mod_003",
 *   order: 1,
 *   prerequisites: []
 * }
 *
 * ali:
 *
 * {
 *   learning_unit_id: "ue_001",
 *   order: 1,
 *   prerequisites: []
 * }
 */
export const normalizeRouteNode = (
	content: RawDetailContent,
	type: RouteNode['type'],
	fallbackTitle: string,
): RouteNode => {
	return {
		id: normalizeContentId(content),
		type,
		title: normalizeContentTitle(content, fallbackTitle),
		description: normalizeContentDescription(content),
		durationHours: normalizeDurationHours(content),
		durationMin: normalizeDurationMin(content),
		order: getNumberOrUndefined(content.order),
		parallelGroup: getOptionalText(content.parallel_group),
		isRequired:
			typeof content.is_required === 'boolean'
				? content.is_required
				: undefined,
		prerequisites: getArrayOrEmpty(content.prerequisites),
	}
}

/**
 * Normalizira seznam vsebin v RouteNode[].
 *
 * Če backend vrne null ali undefined,
 * funkcija vrne prazen array.
 *
 * Elemente brez ID-ja odstranimo,
 * ker brez ID-ja ne moremo narediti pravilne povezave na detail stran.
 */
export const normalizeRouteNodes = (
	items: RawDetailContent[] | null | undefined,
	type: RouteNode['type'],
	fallbackTitle: string,
): RouteNode[] => {
	return getArrayOrEmpty(items)
		.map((item) => normalizeRouteNode(item, type, fallbackTitle))
		.filter((item) => Boolean(item.id))
		.sort((firstItem, secondItem) => {
			const firstOrder = firstItem.order ?? Number.MAX_SAFE_INTEGER
			const secondOrder = secondItem.order ?? Number.MAX_SAFE_INTEGER

			return firstOrder - secondOrder
		})
}


