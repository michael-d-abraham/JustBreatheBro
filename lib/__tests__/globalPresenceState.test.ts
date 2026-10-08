import type { GlobalServerMessage } from "@/lib/globalPresenceProtocol";
import {
  GHOST_TTL_MS,
  MAX_ACTIVE_PULSES,
  PULSE_RETENTION_MS,
  applyGlobalMessage,
  createInitialPresenceState,
  expirePresenceState,
  isCoolingDown,
  nextExpiryAtMs,
  type GlobalPresenceState,
} from "@/lib/globalPresenceState";

const dot = (id: string, lat = 10, lon = 20) => ({ id, lat, lon });

const snapshot = (
  selfId: string,
  participants = [dot(selfId)],
  pulseCooldownMs = 5000,
): GlobalServerMessage => ({
  type: "snapshot",
  selfId,
  pulseCooldownMs,
  participants,
  serverTimeMs: 0,
});

function run(state: GlobalPresenceState, now: number, ...messages: GlobalServerMessage[]) {
  let current = state;
  for (const m of messages) current = applyGlobalMessage(current, m, now).state;
  return current;
}

describe("snapshot", () => {
  it("empty room: only you, still a valid map to render", () => {
    const { state } = applyGlobalMessage(createInitialPresenceState(), snapshot("me"), 1000);
    expect(state.selfId).toBe("me");
    expect(Object.keys(state.participants)).toEqual(["me"]);
    expect(state.ghosts).toEqual({});
    expect(state.pulses).toEqual([]);
  });

  it("replaces everything: a reconnect snapshot never carries over the old session", () => {
    let s = run(
      createInitialPresenceState(),
      1000,
      snapshot("old", [dot("old"), dot("a")]),
      { type: "pulse", id: "a", serverTimeMs: 0 },
      { type: "leave", id: "a" },
      { type: "cooldown", retryAfterMs: 4000 },
    );
    expect(s.pulses.length).toBeGreaterThan(0);
    expect(Object.keys(s.ghosts)).toEqual(["a"]);
    expect(s.cooldownUntilMs).not.toBe(0);

    s = applyGlobalMessage(s, snapshot("new", [dot("new"), dot("b")]), 2000).state;
    expect(s.selfId).toBe("new");
    expect(Object.keys(s.participants)).toEqual(["new", "b"]);
    expect(s.ghosts).toEqual({});
    expect(s.pulses).toEqual([]);
    expect(s.cooldownUntilMs).toBe(0);
    expect(s.pulseSeq).toBe(0);
  });

  it("adopts the server's cooldown", () => {
    const { state } = applyGlobalMessage(createInitialPresenceState(), snapshot("me", [dot("me")], 7000), 0);
    expect(state.pulseCooldownMs).toBe(7000);
  });
});

describe("join / leave", () => {
  const base = () => run(createInitialPresenceState(), 0, snapshot("me"));

  it("a joiner appears", () => {
    const s = run(base(), 1, { type: "join", participant: dot("a", 1, 2) });
    expect(s.participants.a).toEqual(dot("a", 1, 2));
  });

  it("a repeated join for the same id updates the dot instead of duplicating", () => {
    const s = run(
      base(),
      1,
      { type: "join", participant: dot("a", 1, 2) },
      { type: "join", participant: dot("a", 3, 4) },
    );
    expect(Object.keys(s.participants).filter((k) => k === "a")).toHaveLength(1);
    expect(s.participants.a).toEqual(dot("a", 3, 4));
  });

  it("a leaver becomes a ghost stamped with when they left", () => {
    const s = run(base(), 1, { type: "join", participant: dot("a", 1, 2) });
    const left = applyGlobalMessage(s, { type: "leave", id: "a" }, 5000).state;
    expect(left.participants.a).toBeUndefined();
    expect(left.ghosts.a).toEqual({ ...dot("a", 1, 2), leftAtMs: 5000 });
  });

  it("ignores a leave for an unknown id and returns the same state object", () => {
    const s = base();
    const result = applyGlobalMessage(s, { type: "leave", id: "ghost-of-nobody" }, 10);
    expect(result.state).toBe(s);
  });

  it("never ghosts yourself", () => {
    const s = base();
    expect(applyGlobalMessage(s, { type: "leave", id: "me" }, 10).state).toBe(s);
  });

  it("a rejoin with a ghosted id revives the dot and removes the ghost", () => {
    let s = run(base(), 1, { type: "join", participant: dot("a") }, { type: "leave", id: "a" });
    expect(s.ghosts.a).toBeDefined();
    s = run(s, 2, { type: "join", participant: dot("a") });
    expect(s.ghosts.a).toBeUndefined();
    expect(s.participants.a).toBeDefined();
  });
});

describe("pulse", () => {
  const room = () =>
    run(createInitialPresenceState(), 0, snapshot("me", [dot("me", 1, 2), dot("a", 3, 4)], 5000));

  it("someone else's pulse: a visible event at their location, no cooldown for you", () => {
    const { state, pulse } = applyGlobalMessage(room(), { type: "pulse", id: "a", serverTimeMs: 0 }, 100);
    expect(pulse).toMatchObject({ seq: 1, id: "a", lat: 3, lon: 4, isSelf: false, atMs: 100 });
    expect(state.pulses).toEqual([pulse]);
    expect(state.cooldownUntilMs).toBe(0);
  });

  it("your own pulse: marked isSelf and starts the cooldown from the server's value", () => {
    const { state, pulse } = applyGlobalMessage(room(), { type: "pulse", id: "me", serverTimeMs: 0 }, 1000);
    expect(pulse?.isSelf).toBe(true);
    expect(state.cooldownUntilMs).toBe(6000);
    expect(isCoolingDown(state, 5999)).toBe(true);
    expect(isCoolingDown(state, 6000)).toBe(false);
  });

  it("empty room: you can still pulse and watch your own ripple", () => {
    const alone = run(createInitialPresenceState(), 0, snapshot("me", [dot("me", 5, 6)]));
    const { state, pulse } = applyGlobalMessage(alone, { type: "pulse", id: "me", serverTimeMs: 0 }, 10);
    expect(pulse).toMatchObject({ id: "me", lat: 5, lon: 6, isSelf: true });
    expect(state.pulses).toHaveLength(1);
  });

  it("a pulse from an unknown id is ignored (nowhere to draw it) and changes nothing", () => {
    const s = room();
    const result = applyGlobalMessage(s, { type: "pulse", id: "stranger", serverTimeMs: 0 }, 5);
    expect(result.state).toBe(s);
    expect(result.pulse).toBeNull();
  });

  it("overlapping pulses in the same instant all get distinct, ordered events", () => {
    let s = room();
    const seqs: number[] = [];
    for (const id of ["a", "me", "a"]) {
      const r = applyGlobalMessage(s, { type: "pulse", id, serverTimeMs: 0 }, 500);
      s = r.state;
      seqs.push(r.pulse!.seq);
    }
    expect(seqs).toEqual([1, 2, 3]);
    expect(s.pulses.map((p) => p.seq)).toEqual([1, 2, 3]);
  });

  it("bounds retained pulses so a burst can never grow state without limit", () => {
    let s = room();
    for (let i = 0; i < MAX_ACTIVE_PULSES + 10; i += 1) {
      s = applyGlobalMessage(s, { type: "pulse", id: "a", serverTimeMs: 0 }, 1).state;
    }
    expect(s.pulses).toHaveLength(MAX_ACTIVE_PULSES);
    expect(s.pulses[s.pulses.length - 1].seq).toBe(MAX_ACTIVE_PULSES + 10);
  });

  it("a ghost's late pulse is ignored (they are no longer connected)", () => {
    const s = run(room(), 1, { type: "leave", id: "a" });
    expect(applyGlobalMessage(s, { type: "pulse", id: "a", serverTimeMs: 0 }, 2).pulse).toBeNull();
  });
});

describe("cooldown message", () => {
  it("sets the local cooldown from the server's retry hint", () => {
    const s = run(createInitialPresenceState(), 0, snapshot("me"));
    const next = applyGlobalMessage(s, { type: "cooldown", retryAfterMs: 3200 }, 1000).state;
    expect(next.cooldownUntilMs).toBe(4200);
    expect(isCoolingDown(next, 4199)).toBe(true);
    expect(isCoolingDown(next, 4200)).toBe(false);
  });
});

describe("expirePresenceState / nextExpiryAtMs", () => {
  it("returns the same object when nothing has expired", () => {
    const s = run(createInitialPresenceState(), 0, snapshot("me"));
    expect(expirePresenceState(s, 123456)).toBe(s);
    expect(nextExpiryAtMs(s)).toBeNull();
  });

  it("ghosts disappear exactly at the TTL, not before", () => {
    const s = run(
      createInitialPresenceState(),
      0,
      snapshot("me", [dot("me"), dot("a")]),
      { type: "leave", id: "a" },
    );
    const leftAt = 0;
    expect(expirePresenceState(s, leftAt + GHOST_TTL_MS - 1)).toBe(s);
    expect(expirePresenceState(s, leftAt + GHOST_TTL_MS).ghosts).toEqual({});
  });

  it("ripple events are retained until their retention elapses", () => {
    const s = run(
      createInitialPresenceState(),
      0,
      snapshot("me", [dot("me"), dot("a")]),
      { type: "pulse", id: "a", serverTimeMs: 0 },
    );
    expect(expirePresenceState(s, PULSE_RETENTION_MS - 1)).toBe(s);
    expect(expirePresenceState(s, PULSE_RETENTION_MS).pulses).toEqual([]);
  });

  it("an elapsed cooldown is cleared", () => {
    const s = run(createInitialPresenceState(), 0, snapshot("me"), { type: "cooldown", retryAfterMs: 1000 });
    expect(expirePresenceState(s, 999).cooldownUntilMs).toBe(1000);
    expect(expirePresenceState(s, 1000).cooldownUntilMs).toBe(0);
  });

  it("only removes what expired and keeps the rest", () => {
    let s = run(createInitialPresenceState(), 0, snapshot("me", [dot("me"), dot("a"), dot("b")]));
    s = applyGlobalMessage(s, { type: "leave", id: "a" }, 0).state;
    s = applyGlobalMessage(s, { type: "leave", id: "b" }, 10_000).state;
    const next = expirePresenceState(s, GHOST_TTL_MS);
    expect(Object.keys(next.ghosts)).toEqual(["b"]);
  });

  it("nextExpiryAtMs is the earliest pending deadline across ghosts, pulses and cooldown", () => {
    let s = run(createInitialPresenceState(), 0, snapshot("me", [dot("me"), dot("a")]));
    s = applyGlobalMessage(s, { type: "pulse", id: "a", serverTimeMs: 0 }, 1000).state;
    s = applyGlobalMessage(s, { type: "cooldown", retryAfterMs: 500 }, 1000).state;
    s = applyGlobalMessage(s, { type: "leave", id: "a" }, 1000).state;
    expect(nextExpiryAtMs(s)).toBe(1500); // cooldown first
    s = expirePresenceState(s, 1500);
    expect(nextExpiryAtMs(s)).toBe(1000 + PULSE_RETENTION_MS); // then the ripple
    s = expirePresenceState(s, 1000 + PULSE_RETENTION_MS);
    expect(nextExpiryAtMs(s)).toBe(1000 + GHOST_TTL_MS); // finally the ghost
    s = expirePresenceState(s, 1000 + GHOST_TTL_MS);
    expect(nextExpiryAtMs(s)).toBeNull();
  });
});
