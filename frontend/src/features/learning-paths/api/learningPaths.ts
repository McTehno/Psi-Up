const API_HOST = import.meta.env.VITE_BACKEND_HOST

export async function getCompetencyRecommendations(groupId: string, answers: {question_index: number, answer_index: number}[]) {
	const response = await fetch(`${API_HOST}/api/recommendations/competencies`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ group_id: groupId, answers }),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch recommendations: ${response.status}`)
	}

	return response.json()
}

export async function generateLearningPath(competencyId: string, currentLevel: string) {
	const response = await fetch(`${API_HOST}/api/learning-paths/generate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ competency_id: competencyId, current_level: currentLevel }),
	})

	if (!response.ok) {
		throw new Error(`Failed to generate learning path: ${response.status}`)
	}

	return response.json()
}


