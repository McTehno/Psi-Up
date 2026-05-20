const API_HOST = import.meta.env.VITE_BACKEND_HOST

export async function getCompetencyGroups() {
	const response = await fetch(`${API_HOST}/api/competency-groups`)

	if (!response.ok) {
		throw new Error(`Failed to fetch competency groups: ${response.status}`)
	}

	return response.json()
}

export async function getCompetencyGroupQuestionnaire(groupId: string) {
	const response = await fetch(
		`${API_HOST}/api/competency-groups/${groupId}/questionnaire`,
	)

	if (!response.ok) {
		throw new Error(`Failed to fetch questionnaire: ${response.status}`)
	}

	return response.json()
}