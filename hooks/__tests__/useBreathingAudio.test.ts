/// <reference path="./react-test-renderer.d.ts" />
/**
 * Behavioral tests for useBreathingAudio.
 *
 * expo-audio is a native module, so useAudioPlayer is mocked with a fake player
 * (play/pause/seekTo/playing/volume). The .wav requires resolve to their path
 * string (jest/wavTransformer.js), which lets us load the hook AND distinguish
 * the inhale vs exhale sources. The hook is rendered with react-test-renderer.
 *
 * Covers: load (player creation + source selection + volume), play, stop, cleanup.
 */

import { act, createElement } from "react";
import TestRenderer from "react-test-renderer";
import { SoundType } from "@/contexts/appSettingsContext";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";

// Mock react-native so the AppState listener in useBreathingAudio is a no-op in tests.
// isAppActiveRef starts true, so all existing play/pause/seek assertions are unaffected.
jest.mock("react-native", () => ({
  AppState: {
    currentState: "active",
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Fake player created per source by the mock below.
jest.mock("expo-audio", () => {
  const players = new Map<string, unknown>();
  const useAudioPlayer = jest.fn((source: unknown, _options: unknown) => {
    const key = JSON.stringify(source);
    if (!players.has(key)) {
      players.set(key, {
        play: jest.fn(),
        pause: jest.fn(),
        seekTo: jest.fn(),
        playing: false,
        volume: 1,
      });
    }
    return players.get(key);
  });
  return {
    useAudioPlayer,
    __resetPlayers: () => players.clear(),
  };
});

// eslint-disable-next-line import/order
import { useAudioPlayer } from "expo-audio";

const mockedUseAudioPlayer = jest.mocked(useAudioPlayer);

// Tell React 19 this is an act() environment.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type FakePlayer = {
  play: jest.Mock;
  pause: jest.Mock;
  seekTo: jest.Mock;
  playing: boolean;
  volume: number;
};

type AudioProps = {
  soundEnabled: boolean;
  isRunning: boolean;
  soundType: SoundType;
};

function renderAudioHook(initialProps: AudioProps) {
  const result: { current: ReturnType<typeof useBreathingAudio> } = {
    current: undefined as unknown as ReturnType<typeof useBreathingAudio>,
  };
  let props = initialProps;

  function Harness() {
    result.current = useBreathingAudio(props);
    return null;
  }

  let renderer: ReturnType<typeof TestRenderer.create>;
  act(() => {
    renderer = TestRenderer.create(createElement(Harness));
  });

  return {
    result,
    rerender(next: AudioProps) {
      props = next;
      act(() => {
        renderer.update(createElement(Harness));
      });
    },
    unmount() {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

/** inhale = first useAudioPlayer call, exhale = second (on the initial render). */
function getPlayers(): { inhale: FakePlayer; exhale: FakePlayer } {
  const results = mockedUseAudioPlayer.mock.results;
  return {
    inhale: results[0].value as unknown as FakePlayer,
    exhale: results[1].value as unknown as FakePlayer,
  };
}

describe("useBreathingAudio", () => {
  beforeEach(() => {
    (
      jest.requireMock("expo-audio") as { __resetPlayers: () => void }
    ).__resetPlayers();
    jest.clearAllMocks();
  });

  describe("load", () => {
    it("creates inhale + exhale players for the selected sound type with keepAudioSessionActive", () => {
      const { unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: false,
        soundType: "guzheng",
      });

      expect(mockedUseAudioPlayer).toHaveBeenCalledTimes(2);
      expect(mockedUseAudioPlayer).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        { keepAudioSessionActive: true }
      );
      expect(mockedUseAudioPlayer).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        { keepAudioSessionActive: true }
      );

      const calls = mockedUseAudioPlayer.mock.calls;
      expect(String(calls[0][0])).toContain("Guzheng/Inhale.m4a");
      expect(String(calls[1][0])).toContain("Guzheng/Exhale.m4a");

      unmount();
    });

    it("uses the sine placeholder sources when sound type is off", () => {
      const { unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: false,
        soundType: "off",
      });

      const calls = mockedUseAudioPlayer.mock.calls;
      expect(String(calls[0][0])).toContain("Sine/Inhale.m4a");
      expect(String(calls[1][0])).toContain("Sine/Exhale.m4a");

      unmount();
    });

    it("sets the breathing volume on both players after mount", () => {
      const { unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: false,
        soundType: "guzheng",
      });

      const { inhale, exhale } = getPlayers();
      expect(inhale.volume).toBe(0.3);
      expect(exhale.volume).toBe(0.3);

      unmount();
    });
  });

  describe("play", () => {
    it("seeks to 0 then plays the inhale player, leaving exhale untouched", async () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();

      await act(async () => {
        await result.current.playInhaleSound();
      });

      expect(inhale.seekTo).toHaveBeenCalledWith(0);
      expect(inhale.play).toHaveBeenCalledTimes(1);
      // seekTo happens before play.
      expect(inhale.seekTo.mock.invocationCallOrder[0]).toBeLessThan(
        inhale.play.mock.invocationCallOrder[0]
      );
      expect(exhale.play).not.toHaveBeenCalled();

      unmount();
    });

    it("seeks to 0 then plays the exhale player", async () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();

      await act(async () => {
        await result.current.playExhaleSound();
      });

      expect(exhale.seekTo).toHaveBeenCalledWith(0);
      expect(exhale.play).toHaveBeenCalledTimes(1);
      expect(inhale.play).not.toHaveBeenCalled();

      unmount();
    });

    it("does not play when sound is disabled", async () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: false,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale } = getPlayers();

      await act(async () => {
        await result.current.playInhaleSound();
      });

      expect(inhale.play).not.toHaveBeenCalled();

      unmount();
    });

    it("does not play when sound type is off", async () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "off",
      });
      const { inhale } = getPlayers();

      await act(async () => {
        await result.current.playInhaleSound();
      });

      expect(inhale.play).not.toHaveBeenCalled();

      unmount();
    });
  });

  describe("stop", () => {
    it("pauses both players (without seeking) when they are playing", () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();
      inhale.playing = true;
      exhale.playing = true;

      act(() => {
        result.current.stopSound();
      });

      expect(inhale.pause).toHaveBeenCalledTimes(1);
      expect(exhale.pause).toHaveBeenCalledTimes(1);
      expect(inhale.seekTo).not.toHaveBeenCalled();
      expect(exhale.seekTo).not.toHaveBeenCalled();

      unmount();
    });

    it("does not pause when players are not playing", () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();

      act(() => {
        result.current.stopSound();
      });

      expect(inhale.pause).not.toHaveBeenCalled();
      expect(exhale.pause).not.toHaveBeenCalled();

      unmount();
    });

    it("forceStop pauses and seeks both players to 0", () => {
      const { result, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();
      inhale.playing = true;
      exhale.playing = true;

      act(() => {
        result.current.forceStop();
      });

      expect(inhale.pause).toHaveBeenCalledTimes(1);
      expect(exhale.pause).toHaveBeenCalledTimes(1);
      expect(inhale.seekTo).toHaveBeenCalledWith(0);
      expect(exhale.seekTo).toHaveBeenCalledWith(0);

      unmount();
    });
  });

  describe("cleanup", () => {
    it("pauses and seeks both players to 0 on unmount when playing", () => {
      const { unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();
      inhale.playing = true;
      exhale.playing = true;

      unmount();

      expect(inhale.pause).toHaveBeenCalledTimes(1);
      expect(exhale.pause).toHaveBeenCalledTimes(1);
      expect(inhale.seekTo).toHaveBeenCalledWith(0);
      expect(exhale.seekTo).toHaveBeenCalledWith(0);
    });

    it("stops cues when sound is disabled mid-session (master mute)", () => {
      const { rerender, unmount } = renderAudioHook({
        soundEnabled: true,
        isRunning: true,
        soundType: "guzheng",
      });
      const { inhale, exhale } = getPlayers();
      inhale.playing = true;
      exhale.playing = true;

      rerender({ soundEnabled: false, isRunning: true, soundType: "guzheng" });

      expect(inhale.pause).toHaveBeenCalledTimes(1);
      expect(exhale.pause).toHaveBeenCalledTimes(1);
      expect(inhale.seekTo).toHaveBeenCalledWith(0);
      expect(exhale.seekTo).toHaveBeenCalledWith(0);

      unmount();
    });
  });
});
