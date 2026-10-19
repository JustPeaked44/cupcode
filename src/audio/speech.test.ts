import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { SpeechPlayer, selectVoice } from "./speech";
import { act, renderHook } from "@testing-library/react";
import { useSpeech } from "./useSpeech";
class MockUtterance {
  text: string;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
const voice = (name: string, lang = "en-US") =>
  ({ name, lang }) as SpeechSynthesisVoice;
describe("speech lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  function setup(voices: SpeechSynthesisVoice[] = []) {
    const synth = {
      getVoices: () => voices,
      cancel: vi.fn(),
      speak: vi.fn(),
      resume: vi.fn(),
    };
    const notify = vi.fn();
    const player = new SpeechPlayer(
      synth as unknown as SpeechSynthesis,
      notify,
    );
    return {
      synth,
      notify,
      player,
      utterance: () => synth.speak.mock.calls.at(-1)![0] as MockUtterance,
    };
  }
  it("selects English and best-effort preferences with safe fallback", () => {
    const voices = [
      voice("Other", "fr-FR"),
      voice("Microsoft David"),
      voice("Samantha"),
    ];
    expect(selectVoice(voices, "female", 0)?.name).toBe("Samantha");
    expect(selectVoice(voices, "male", 0)?.name).toBe("Microsoft David");
    expect(selectVoice([voices[1]], "female", 0)?.name).toBe("Microsoft David");
    expect(selectVoice(voices, "varied", 1)?.name).toBe("Samantha");
    expect(selectVoice([], "male", 0)).toBeUndefined();
  });
  it("cancels before speaking and keeps the exact text on replay", () => {
    const { player, synth, utterance } = setup();
    const text = "Two drinks, please. Three shots in total.";
    player.play(text, "male", 0);
    expect(utterance().text).toBe(text);
    player.play(text, "male", 0);
    expect(utterance().text).toBe(text);
    expect(synth.cancel).toHaveBeenCalledTimes(2);
    expect(synth.speak).toHaveBeenCalledTimes(2);
    expect(synth.cancel.mock.invocationCallOrder[1]).toBeLessThan(
      synth.speak.mock.invocationCallOrder[1],
    );
  });
  it("ignores stale callbacks during rapid order changes", () => {
    const { player, notify, utterance } = setup();
    player.play("first", "varied", 0);
    const oldEnd = utterance().onend!;
    const oldStart = utterance().onstart!;
    player.play("second", "varied", 1);
    const count = notify.mock.calls.length;
    oldEnd();
    oldStart();
    expect(notify).toHaveBeenCalledTimes(count);
    utterance().onstart?.();
    expect(notify.mock.lastCall![0].speaking).toBe(true);
    player.stop();
    expect(utterance().onend).toBeNull();
    vi.runAllTimers();
    expect(notify.mock.lastCall![0].speaking).toBe(false);
  });
  it("supports missing engines, empty voice lists, errors and delayed startup", () => {
    const notify = vi.fn();
    new SpeechPlayer(undefined, notify).play("order", "female", 0);
    expect(notify.mock.lastCall![0].text).toContain("unavailable");
    const context = setup();
    context.player.play("order", "female", 0);
    expect(context.synth.speak).toHaveBeenCalled();
    vi.advanceTimersByTime(6000);
    expect(context.notify.mock.lastCall![0].text).toContain("has not started");
    context.utterance().onerror?.();
    expect(context.notify.mock.lastCall![0].text).toContain("could not play");
  });
  it("handles an engine that throws and stops on cleanup", () => {
    const { player, synth, notify } = setup();
    synth.speak.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => player.play("order", "varied", 0)).not.toThrow();
    expect(notify.mock.lastCall![0].text).toContain("could not play");
    player.stop(false);
    expect(synth.cancel).toHaveBeenCalled();
  });
  it("refreshes asynchronously discovered voices without autoplay and cleans up listeners", () => {
    const engine = new EventTarget() as EventTarget & {
      getVoices: ReturnType<typeof vi.fn>;
      cancel: ReturnType<typeof vi.fn>;
      speak: ReturnType<typeof vi.fn>;
    };
    engine.getVoices = vi.fn(() => []);
    engine.cancel = vi.fn();
    engine.speak = vi.fn();
    const remove = vi.spyOn(engine, "removeEventListener");
    vi.stubGlobal("speechSynthesis", engine);
    const hook = renderHook(useSpeech);
    expect(hook.result.current.voices).toEqual([]);
    engine.getVoices.mockReturnValue([voice("Samantha")]);
    act(() => engine.dispatchEvent(new Event("voiceschanged")));
    expect(hook.result.current.voices[0].name).toBe("Samantha");
    expect(engine.speak).not.toHaveBeenCalled();
    hook.unmount();
    expect(remove).toHaveBeenCalledWith("voiceschanged", expect.any(Function));
    expect(engine.cancel).toHaveBeenCalled();
  });
});
