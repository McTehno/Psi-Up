export type VoiceHelpRequest = {
  targetType?: "learning_path" | "module" | "learning_unit";
  targetId?: string;
  questionId?: string;
  questionText: string;
  answerOptions?: string[];
};

export type VoiceHelpResponse = {
  help_text: string;
  audio_url: string;
  cached: boolean;
  content_hash: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

function buildApiUrl(path: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

export async function getQuestionVoiceHelp(
  request: VoiceHelpRequest
): Promise<VoiceHelpResponse> {
  const response = await fetch(buildApiUrl("/voice-help/question"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_type: request.targetType,
      target_id: request.targetId,
      question_id: request.questionId,
      question_text: request.questionText,
      answer_options: request.answerOptions ?? ["Da", "Ne"],
      locale: "sl-SI",
      voice_name: "sl-SI-PetraNeural",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.detail ?? "Glasovna pomoč ni bila uspešno ustvarjena."
    );
  }

  return response.json();
}

