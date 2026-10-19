export type VoicePreference = "varied" | "female" | "male";
export type SpeechStatus = { text: string; speaking: boolean; voice?: string };
const knownVoices = {
  female: /zira|samantha|victoria|karen|moira|susan|hazel|aria|jenny|sara/i,
  male: /david|mark|daniel|alex\b|george|guy|james|ryan/i,
};
export function selectVoice(
  voices: SpeechSynthesisVoice[],
  preference: VoicePreference,
  variant: number,
) {
  const english = voices.filter((voice) => /^en(?:-|_|$)/i.test(voice.lang));
  const matching =
    preference === "varied"
      ? english
      : english.filter((voice) => knownVoices[preference].test(voice.name));
  const pool = matching.length ? matching : english.length ? english : voices;
  return pool.length ? pool[variant % pool.length] : undefined;
}
export class SpeechPlayer {
  private token = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private utterance?: SpeechSynthesisUtterance;
  constructor(
    private synth: SpeechSynthesis | undefined,
    private notify: (status: SpeechStatus) => void,
  ) {}
  stop(notify = true) {
    this.token++;
    clearTimeout(this.timer);
    if (this.utterance) {
      this.utterance.onstart = null;
      this.utterance.onend = null;
      this.utterance.onerror = null;
    }
    try {
      this.synth?.cancel();
    } catch {
      /* Some embedded browsers expose an unusable speech engine. */
    }
    this.utterance = undefined;
    if (notify)
      this.notify({
        text: this.synth
          ? "Audio stopped. Replay whenever you’re ready."
          : "Speech unavailable. Read the order to practice.",
        speaking: false,
      });
  }
  play(text: string, preference: VoicePreference, variant: number) {
    this.stop(false);
    if (!this.synth || typeof SpeechSynthesisUtterance === "undefined") {
      this.notify({
        text: "Speech unavailable. Read the order to practice.",
        speaking: false,
      });
      return;
    }
    const token = this.token;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;
      const voice = selectVoice(this.synth.getVoices(), preference, variant);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || "en-PH";
      utterance.rate = 0.94;
      utterance.pitch = 1;
      const voiceName = voice?.name || "System default";
      const update = (status: SpeechStatus) => {
        if (token === this.token) this.notify({ ...status, voice: voiceName });
      };
      utterance.onstart = () => {
        clearTimeout(this.timer);
        update({ text: "Speaking customer order…", speaking: true });
      };
      utterance.onend = () => {
        clearTimeout(this.timer);
        update({
          text: "Order finished. Replay whenever you need.",
          speaking: false,
        });
      };
      utterance.onerror = () => {
        clearTimeout(this.timer);
        update({
          text: "Audio could not play. Read the order or try Replay Order.",
          speaking: false,
        });
      };
      update({
        text: "Starting audio… If it stays silent, use Replay Order.",
        speaking: false,
      });
      this.timer = setTimeout(
        () =>
          update({
            text: "Audio has not started. Use Replay Order, or read the text.",
            speaking: false,
          }),
        6000,
      );
      this.synth.resume();
      this.synth.speak(utterance);
    } catch {
      this.stop(false);
      this.notify({
        text: "Audio could not play. Text practice is available.",
        speaking: false,
      });
    }
  }
}
