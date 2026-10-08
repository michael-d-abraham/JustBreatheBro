import {
  BREATH_ROOM_PRODUCTION_WS_URL,
  getBreathRoomWsUrl,
  getGlobalRoomWsUrl,
} from "@/lib/breathRoomBackend";

describe("getBreathRoomWsUrl", () => {
  const prevRoom = process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
  const prevWs = process.env.EXPO_PUBLIC_WS_URL;

  afterEach(() => {
    if (prevRoom === undefined) {
      delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    } else {
      process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = prevRoom;
    }
    if (prevWs === undefined) {
      delete process.env.EXPO_PUBLIC_WS_URL;
    } else {
      process.env.EXPO_PUBLIC_WS_URL = prevWs;
    }
  });

  it("defaults to production wss when env unset", () => {
    delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    delete process.env.EXPO_PUBLIC_WS_URL;
    expect(getBreathRoomWsUrl()).toBe(BREATH_ROOM_PRODUCTION_WS_URL);
  });

  it("treats whitespace-only env as unset (falls through to production)", () => {
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = "   ";
    delete process.env.EXPO_PUBLIC_WS_URL;
    expect(getBreathRoomWsUrl()).toBe(BREATH_ROOM_PRODUCTION_WS_URL);
  });

  it("returns trimmed URL when set on BREATH_ROOM", () => {
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = "  ws://localhost:3333  ";
    delete process.env.EXPO_PUBLIC_WS_URL;
    expect(getBreathRoomWsUrl()).toBe("ws://localhost:3333");
  });

  it("falls back to EXPO_PUBLIC_WS_URL", () => {
    delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    process.env.EXPO_PUBLIC_WS_URL = "ws://localhost:8085";
    expect(getBreathRoomWsUrl()).toBe("ws://localhost:8085");
  });
});

describe("getGlobalRoomWsUrl", () => {
  const prevRoom = process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
  const prevWs = process.env.EXPO_PUBLIC_WS_URL;

  afterEach(() => {
    if (prevRoom === undefined) {
      delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    } else {
      process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = prevRoom;
    }
    if (prevWs === undefined) {
      delete process.env.EXPO_PUBLIC_WS_URL;
    } else {
      process.env.EXPO_PUBLIC_WS_URL = prevWs;
    }
  });

  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    delete process.env.EXPO_PUBLIC_WS_URL;
  });

  it("appends /global to the production host by default", () => {
    expect(getGlobalRoomWsUrl()).toBe("wss://api.hellobreathbro.app/global");
  });

  it("uses the same env overrides as the breathing rooms (local server)", () => {
    process.env.EXPO_PUBLIC_WS_URL = "ws://localhost:8085";
    expect(getGlobalRoomWsUrl()).toBe("ws://localhost:8085/global");
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = "ws://10.0.2.2:8085";
    expect(getGlobalRoomWsUrl()).toBe("ws://10.0.2.2:8085/global");
  });

  it("tolerates a trailing slash, an existing path, a query string and a hash", () => {
    for (const base of [
      "wss://example.com/",
      "wss://example.com//",
      "wss://example.com/some/path",
      "wss://example.com/?x=1",
      "wss://example.com#frag",
      "  wss://example.com  ",
    ]) {
      process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = base;
      expect(getGlobalRoomWsUrl()).toBe("wss://example.com/global");
    }
  });

  it("keeps an explicit port", () => {
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = "wss://example.com:8443/old";
    expect(getGlobalRoomWsUrl()).toBe("wss://example.com:8443/global");
  });

  it("falls back to plain concatenation for a base that is not ws(s)://", () => {
    process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL = "example.com/";
    expect(getGlobalRoomWsUrl()).toBe("example.com/global");
  });
});
