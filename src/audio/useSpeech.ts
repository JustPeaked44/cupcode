import { useEffect, useRef, useState } from "react";
import {
  SpeechPlayer,
  type SpeechStatus,
  type VoicePreference,
} from "./speech";
export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>({
    text: "Replay the order to listen. Voice availability depends on your device.",
    speaking: false,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preference, setPreference] = useState<VoicePreference>("varied");
  const player = useRef<SpeechPlayer | null>(null);
  if (!player.current)
    player.current = new SpeechPlayer(
      typeof window !== "undefined" ? window.speechSynthesis : undefined,
      setStatus,
    );
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) {
      setStatus({
        text: "Speech unavailable in this browser. Read the order to practice.",
        speaking: false,
      });
      return;
    }
    const refresh = () => {
      try {
        setVoices(synth.getVoices());
      } catch {
        setVoices([]);
      }
    };
    refresh();
    synth.addEventListener("voiceschanged", refresh);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      player.current?.stop(false);
    };
  }, []);
  return {
    status,
    voices,
    preference,
    setPreference,
    play: (text: string, variant: number) =>
      player.current!.play(text, preference, variant),
    stop: () => player.current!.stop(),
  };
}
