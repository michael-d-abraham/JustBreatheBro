/**
 * Behavioral tests for lib/storage.ts.
 *
 * AsyncStorage is replaced with the official in-memory mock that ships with
 * @react-native-async-storage/async-storage. Each test starts from a blank
 * store via AsyncStorage.clear() in beforeEach so tests cannot pollute each
 * other through shared storage state.
 *
 * Covers:
 *   save + load   — full JSON round-trip for every persisted key preserves all
 *                   fields and returns the original value on a subsequent read.
 *   persistence   — a second independent call to the getter after a setter still
 *                   returns the saved value (no in-memory shortcut).
 *   overwrite     — a second save replaces the first; the getter returns only
 *                   the latest value.
 *   missing value — every getter returns a safe default (null or defaultExercises)
 *                   when the key has never been written; nothing throws.
 *   null input    — saveBackgroundImage(null) removes the key so the getter
 *                   returns null (does not store the string "null").
 *   key isolation — writing one key does not change the value of another key.
 *   initializeStorage — seeds defaultExercises when absent; is a no-op when
 *                       exercises are already stored.
 *   resetStorage  — reseeds exercises with defaults and clears currentExercise.
 *   forceUpdateToDefaults — overwrites any stored exercises with defaults.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultExercises,
  Exercise,
  forceUpdateToDefaults,
  getAnimationTheme,
  getAppleHealthConnected,
  getAppleHealthLastSessionId,
  getAppleHealthSyncEnabled,
  getBackgroundImage,
  getCurrentExercise,
  getExercises,
  initializeStorage,
  resetStorage,
  saveAnimationTheme,
  saveAppleHealthConnected,
  saveAppleHealthLastSessionId,
  saveAppleHealthSyncEnabled,
  saveBackgroundImage,
  saveCurrentExercise,
  saveExercises,
} from "@/lib/storage";

jest.mock(
  "@react-native-async-storage/async-storage",
  () =>
    require(
      "@react-native-async-storage/async-storage/jest/async-storage-mock",
    ),
);

// A single custom exercise used wherever a stored value is needed.
const EXERCISE_A: Exercise = {
  id: "test-a",
  title: "Alpha Breath",
  inhale: 3,
  hold1: 1,
  exhale: 5,
  hold2: 2,
  shortDescription: "Short A",
  description: "Description A",
  benefit: "Benefit A",
  method: "Method A",
  symbol: "✦",
};

const EXERCISE_B: Exercise = {
  id: "test-b",
  title: "Beta Breath",
  inhale: 4,
  hold1: 4,
  exhale: 4,
  hold2: 4,
  shortDescription: "Short B",
  description: "Description B",
  benefit: "Benefit B",
  method: "Method B",
  symbol: "◈",
};

describe("lib/storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // ── exercises ────────────────────────────────────────────────────────────────

  describe("getExercises", () => {
    it("returns defaultExercises when the key has never been written", async () => {
      const result = await getExercises();
      expect(result).toEqual(defaultExercises);
    });

    it("returns the saved list after saveExercises", async () => {
      await saveExercises([EXERCISE_A]);
      expect(await getExercises()).toEqual([EXERCISE_A]);
    });

    it("returns an empty array when an empty array was explicitly saved", async () => {
      // Storing [] is a legitimate user state; the empty-stored value is
      // truthy as JSON ("[]") so the fallback to defaultExercises must not fire.
      await saveExercises([]);
      expect(await getExercises()).toEqual([]);
    });

    it("preserves every field through the JSON round-trip", async () => {
      await saveExercises([EXERCISE_A]);
      const [retrieved] = await getExercises();
      expect(retrieved).toStrictEqual(EXERCISE_A);
    });
  });

  describe("saveExercises", () => {
    it("persists a multi-item list that survives a subsequent getExercises call", async () => {
      const list = [EXERCISE_A, EXERCISE_B];
      await saveExercises(list);
      expect(await getExercises()).toEqual(list);
    });

    it("overwrites previously stored exercises on a second save", async () => {
      await saveExercises([EXERCISE_A]);
      await saveExercises([EXERCISE_B]);
      expect(await getExercises()).toEqual([EXERCISE_B]);
    });

    it("does not affect the currentExercise key", async () => {
      await saveCurrentExercise(EXERCISE_A);
      await saveExercises([EXERCISE_B]);
      expect(await getCurrentExercise()).toEqual(EXERCISE_A);
    });
  });

  // ── currentExercise ──────────────────────────────────────────────────────────

  describe("getCurrentExercise", () => {
    it("returns null when the key has never been written", async () => {
      expect(await getCurrentExercise()).toBeNull();
    });

    it("returns the saved exercise after saveCurrentExercise", async () => {
      await saveCurrentExercise(EXERCISE_A);
      expect(await getCurrentExercise()).toEqual(EXERCISE_A);
    });

    it("preserves every field through the JSON round-trip", async () => {
      await saveCurrentExercise(EXERCISE_A);
      expect(await getCurrentExercise()).toStrictEqual(EXERCISE_A);
    });
  });

  describe("saveCurrentExercise", () => {
    it("overwrites a previously stored exercise on a second save", async () => {
      await saveCurrentExercise(EXERCISE_A);
      await saveCurrentExercise(EXERCISE_B);
      expect(await getCurrentExercise()).toEqual(EXERCISE_B);
    });

    it("does not affect the exercises list key", async () => {
      await saveExercises(defaultExercises);
      await saveCurrentExercise(EXERCISE_A);
      expect(await getExercises()).toEqual(defaultExercises);
    });
  });

  // ── backgroundImage ──────────────────────────────────────────────────────────

  describe("getBackgroundImage", () => {
    it("returns null when the key has never been written", async () => {
      expect(await getBackgroundImage()).toBeNull();
    });

    it("returns the stored path after saveBackgroundImage", async () => {
      await saveBackgroundImage("zenscapes/mountain.jpg");
      expect(await getBackgroundImage()).toBe("zenscapes/mountain.jpg");
    });
  });

  describe("saveBackgroundImage", () => {
    it("persists a path string that survives a subsequent getBackgroundImage call", async () => {
      await saveBackgroundImage("zenscapes/ocean.jpg");
      expect(await getBackgroundImage()).toBe("zenscapes/ocean.jpg");
    });

    it("overwrites a previously stored path", async () => {
      await saveBackgroundImage("zenscapes/first.jpg");
      await saveBackgroundImage("zenscapes/second.jpg");
      expect(await getBackgroundImage()).toBe("zenscapes/second.jpg");
    });

    it("removes the key when called with null so getBackgroundImage returns null", async () => {
      await saveBackgroundImage("zenscapes/mountain.jpg");
      await saveBackgroundImage(null);
      expect(await getBackgroundImage()).toBeNull();
    });
  });

  // ── animationTheme ───────────────────────────────────────────────────────────

  describe("getAnimationTheme", () => {
    it("returns null when the key has never been written", async () => {
      expect(await getAnimationTheme()).toBeNull();
    });

    it("returns the stored theme after saveAnimationTheme", async () => {
      await saveAnimationTheme("aurora");
      expect(await getAnimationTheme()).toBe("aurora");
    });
  });

  describe("saveAnimationTheme", () => {
    it("persists the theme string that survives a subsequent getAnimationTheme call", async () => {
      await saveAnimationTheme("ocean");
      expect(await getAnimationTheme()).toBe("ocean");
    });

    it("overwrites a previously stored theme", async () => {
      await saveAnimationTheme("aurora");
      await saveAnimationTheme("ember");
      expect(await getAnimationTheme()).toBe("ember");
    });
  });

  // ── Apple Health ───────────────────────────────────────────────────────────

  describe("getAppleHealthSyncEnabled", () => {
    it("returns false when the key has never been written", async () => {
      expect(await getAppleHealthSyncEnabled()).toBe(false);
    });

    it("returns the stored boolean after saveAppleHealthSyncEnabled", async () => {
      await saveAppleHealthSyncEnabled(true);
      expect(await getAppleHealthSyncEnabled()).toBe(true);
    });
  });

  describe("saveAppleHealthSyncEnabled", () => {
    it("persists false explicitly", async () => {
      await saveAppleHealthSyncEnabled(true);
      await saveAppleHealthSyncEnabled(false);
      expect(await getAppleHealthSyncEnabled()).toBe(false);
    });

    it("does not affect the connected key", async () => {
      await saveAppleHealthConnected(true);
      await saveAppleHealthSyncEnabled(false);
      expect(await getAppleHealthConnected()).toBe(true);
    });
  });

  describe("getAppleHealthConnected", () => {
    it("returns false when the key has never been written", async () => {
      expect(await getAppleHealthConnected()).toBe(false);
    });

    it("returns the stored boolean after saveAppleHealthConnected", async () => {
      await saveAppleHealthConnected(true);
      expect(await getAppleHealthConnected()).toBe(true);
    });
  });

  describe("apple health last session id", () => {
    it("returns null when the key has never been written", async () => {
      expect(await getAppleHealthLastSessionId()).toBeNull();
    });

    it("round-trips a session id", async () => {
      await saveAppleHealthLastSessionId("session-abc");
      expect(await getAppleHealthLastSessionId()).toBe("session-abc");
    });

    it("overwrites a previously stored session id", async () => {
      await saveAppleHealthLastSessionId("session-1");
      await saveAppleHealthLastSessionId("session-2");
      expect(await getAppleHealthLastSessionId()).toBe("session-2");
    });
  });

  // ── initializeStorage ────────────────────────────────────────────────────────

  describe("initializeStorage", () => {
    it("seeds defaultExercises when no exercises key exists", async () => {
      await initializeStorage();
      expect(await getExercises()).toEqual(defaultExercises);
    });

    it("is a no-op when exercises are already stored (does not overwrite)", async () => {
      const custom = [EXERCISE_A];
      await saveExercises(custom);
      await initializeStorage();
      expect(await getExercises()).toEqual(custom);
    });

    it("can be called multiple times without corrupting the store", async () => {
      await initializeStorage();
      await initializeStorage();
      expect(await getExercises()).toEqual(defaultExercises);
    });
  });

  // ── resetStorage ─────────────────────────────────────────────────────────────

  describe("resetStorage", () => {
    it("resets exercises to defaultExercises regardless of what was stored", async () => {
      await saveExercises([EXERCISE_A, EXERCISE_B]);
      await resetStorage();
      expect(await getExercises()).toEqual(defaultExercises);
    });

    it("clears currentExercise so it returns null after reset", async () => {
      await saveCurrentExercise(EXERCISE_A);
      await resetStorage();
      expect(await getCurrentExercise()).toBeNull();
    });
  });

  // ── forceUpdateToDefaults ─────────────────────────────────────────────────────

  describe("forceUpdateToDefaults", () => {
    it("overwrites custom exercises with defaultExercises", async () => {
      await saveExercises([EXERCISE_A]);
      await forceUpdateToDefaults();
      expect(await getExercises()).toEqual(defaultExercises);
    });

    it("works from a blank store (no prior exercises key)", async () => {
      await forceUpdateToDefaults();
      expect(await getExercises()).toEqual(defaultExercises);
    });
  });
});
