import { useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  getQuestionVoiceHelp,
  type VoiceHelpRequest,
} from "../../services/voice-help-service";

type VoiceHelpButtonProps = VoiceHelpRequest & {
  className?: string;
};

export function VoiceHelpButton({
  targetType,
  targetId,
  questionId,
  questionText,
  answerOptions = ["Da", "Ne"],
  className = "",
}: VoiceHelpButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handlePlayVoiceHelp() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const voiceHelp = await getQuestionVoiceHelp({
        targetType,
        targetId,
        questionId,
        questionText,
        answerOptions,
      });

      const audio = new Audio(voiceHelp.audio_url);
      audioRef.current = audio;

      await audio.play();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Glasovne pomoči trenutno ni mogoče predvajati.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handlePlayVoiceHelp}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Volume2 size={20} />
        {isLoading ? "Pripravljam glasovno pomoč ..." : "Glasovna pomoč"}
      </button>

      {errorMessage ? (
        <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}