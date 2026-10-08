import {
  DEFAULT_PULSE_COOLDOWN_MS,
  GLOBAL_PULSE_REQUEST,
  decodeGlobalMessage,
} from "@/lib/globalPresenceProtocol";

const dot = (id: string, lat = 10, lon = 20) => ({ id, lat, lon });

describe("GLOBAL_PULSE_REQUEST", () => {
  it("is the single message the client ever sends", () => {
    expect(JSON.parse(GLOBAL_PULSE_REQUEST)).toEqual({ type: "pulse" });
  });
});

describe("decodeGlobalMessage — valid frames", () => {
  it("decodes a snapshot, including the receiving user in participants", () => {
    const msg = decodeGlobalMessage(
      JSON.stringify({
        type: "snapshot",
        v: 1,
        serverTimeMs: 1730000000000,
        selfId: "me",
        pulseCooldownMs: 5000,
        participants: [dot("me", 35.4, 137), dot("them", -14.9, -49.6)],
      }),
    );
    expect(msg).toEqual({
      type: "snapshot",
      selfId: "me",
      pulseCooldownMs: 5000,
      serverTimeMs: 1730000000000,
      participants: [dot("me", 35.4, 137), dot("them", -14.9, -49.6)],
    });
  });

  it("decodes an empty-room snapshot (only yourself)", () => {
    const msg = decodeGlobalMessage(
      JSON.stringify({ type: "snapshot", selfId: "me", participants: [dot("me")] }),
    );
    expect(msg?.type).toBe("snapshot");
    if (msg?.type === "snapshot") expect(msg.participants).toHaveLength(1);
  });

  it("decodes join, leave, pulse and cooldown", () => {
    expect(decodeGlobalMessage(JSON.stringify({ type: "join", participant: dot("a") }))).toEqual({
      type: "join",
      participant: dot("a"),
    });
    expect(decodeGlobalMessage(JSON.stringify({ type: "leave", id: "a" }))).toEqual({
      type: "leave",
      id: "a",
    });
    expect(
      decodeGlobalMessage(JSON.stringify({ type: "pulse", id: "a", serverTimeMs: 5 })),
    ).toEqual({ type: "pulse", id: "a", serverTimeMs: 5 });
    expect(
      decodeGlobalMessage(JSON.stringify({ type: "cooldown", retryAfterMs: 3200 })),
    ).toEqual({ type: "cooldown", retryAfterMs: 3200 });
  });

  it("accepts coordinates exactly on the valid boundaries", () => {
    const msg = decodeGlobalMessage(
      JSON.stringify({ type: "join", participant: dot("edge", -90, 180) }),
    );
    expect(msg).toEqual({ type: "join", participant: dot("edge", -90, 180) });
  });
});

describe("decodeGlobalMessage — snapshot hardening", () => {
  const snapshot = (over: Record<string, unknown>) =>
    decodeGlobalMessage(
      JSON.stringify({ type: "snapshot", selfId: "me", participants: [dot("me")], ...over }),
    );

  it("drops invalid participants but keeps the valid ones", () => {
    const msg = snapshot({
      participants: [
        dot("ok"),
        { id: "", lat: 1, lon: 1 },
        { id: "badlat", lat: 91, lon: 1 },
        { id: "badlon", lat: 1, lon: -181 },
        { id: "nolat", lon: 1 },
        { id: "nulllat", lat: null, lon: 1 },
        { id: "str", lat: "1", lon: 1 },
        { id: "x".repeat(65), lat: 1, lon: 1 },
        "nope",
        null,
        7,
        [],
      ],
    });
    expect(msg?.type === "snapshot" && msg.participants.map((p) => p.id)).toEqual(["ok"]);
  });

  it("de-duplicates participants by id (first wins)", () => {
    const msg = snapshot({ participants: [dot("a", 1, 1), dot("a", 2, 2), dot("b")] });
    expect(msg?.type === "snapshot" && msg.participants).toEqual([dot("a", 1, 1), dot("b")]);
  });

  it("strips unknown fields so they can never reach state", () => {
    const msg = snapshot({
      participants: [{ id: "a", lat: 1, lon: 2, ip: "1.2.3.4", country: "JP" }],
    });
    expect(msg?.type === "snapshot" && msg.participants[0]).toEqual(dot("a", 1, 2));
  });

  it("falls back to the default cooldown when missing, negative or non-numeric", () => {
    for (const bad of [undefined, -1, "5000", null]) {
      const msg = snapshot({ pulseCooldownMs: bad });
      expect(msg?.type === "snapshot" && msg.pulseCooldownMs).toBe(DEFAULT_PULSE_COOLDOWN_MS);
    }
  });

  it("clamps an absurd cooldown", () => {
    const msg = snapshot({ pulseCooldownMs: 10_000_000 });
    expect(msg?.type === "snapshot" && msg.pulseCooldownMs).toBe(60_000);
  });

  it("rejects a snapshot without a usable selfId or participants array", () => {
    expect(snapshot({ selfId: undefined })).toBeNull();
    expect(snapshot({ selfId: "" })).toBeNull();
    expect(snapshot({ selfId: 5 })).toBeNull();
    expect(snapshot({ participants: "all" })).toBeNull();
    expect(snapshot({ participants: undefined })).toBeNull();
  });
});

describe("decodeGlobalMessage — malformed input never throws and yields null", () => {
  it("rejects invalid payloads for each message type", () => {
    const bad = [
      { type: "join" },
      { type: "join", participant: null },
      { type: "join", participant: { id: "a", lat: 100, lon: 0 } },
      { type: "leave" },
      { type: "leave", id: "" },
      { type: "leave", id: 3 },
      { type: "pulse" },
      { type: "pulse", id: "" },
      { type: "cooldown" },
      { type: "cooldown", retryAfterMs: 0 },
      { type: "cooldown", retryAfterMs: -5 },
      { type: "cooldown", retryAfterMs: "soon" },
      { type: "chat", text: "hi" },
      { type: 5 },
      {},
    ];
    for (const payload of bad) {
      expect(decodeGlobalMessage(JSON.stringify(payload))).toBeNull();
    }
  });

  it("rejects non-JSON, non-object JSON and non-string frames", () => {
    const frames: unknown[] = [
      "",
      "not json",
      "{",
      "null",
      "42",
      '"snapshot"',
      "[]",
      '[{"type":"leave","id":"a"}]',
      undefined,
      null,
      42,
      {},
      new ArrayBuffer(8),
      new Uint8Array([123, 125]),
    ];
    for (const frame of frames) {
      expect(() => decodeGlobalMessage(frame)).not.toThrow();
      expect(decodeGlobalMessage(frame)).toBeNull();
    }
  });

  it("defaults a missing serverTimeMs rather than failing the message", () => {
    expect(decodeGlobalMessage(JSON.stringify({ type: "pulse", id: "a" }))).toEqual({
      type: "pulse",
      id: "a",
      serverTimeMs: 0,
    });
  });
});
