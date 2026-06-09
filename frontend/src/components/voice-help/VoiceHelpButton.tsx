import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
    audioRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, [stopCurrentAudio]);

  async function handlePlayVoiceHelp() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setIsPlaying(false);

      stopCurrentAudio();

      const voiceHelp = await getQuestionVoiceHelp({
        targetType,
        targetId,
        questionId,
        questionText,
        answerOptions,
      });

      const audio = new Audio(voiceHelp.audio_url);
      audioRef.current = audio;

      audio.onended = () => {
        audio.currentTime = 0;

        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        setIsPlaying(false);
      };

      audio.onerror = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
        }

        setIsPlaying(false);
        setErrorMessage("Glasovne pomoči trenutno ni mogoče predvajati.");
      };

      await audio.play();

      setIsPlaying(true);
    } catch (error) {
      stopCurrentAudio();
      setIsPlaying(false);

      const message =
        error instanceof Error
          ? error.message
          : "Glasovne pomoči trenutno ni mogoče predvajati.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleStopVoiceHelp() {
    stopCurrentAudio();
    setIsPlaying(false);
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePlayVoiceHelp}
          disabled={isLoading || isPlaying}
          aria-label="Predvajaj glasovno pomoč"
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Volume2 size={20} />
          {isLoading
            ? "Pripravljam glasovno pomoč ..."
            : isPlaying
              ? "Predvajanje ..."
              : "Predvajaj glasovno pomoč"}
        </button>

        {isPlaying ? (
          <button
            type="button"
            onClick={handleStopVoiceHelp}
            aria-label="Ustavi glasovno pomoč"
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            <span aria-hidden="true" className="text-xs leading-none">
              ■
            </span>
            Ustavi
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}