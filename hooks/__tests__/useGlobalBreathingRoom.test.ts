import {
  BREATH_ROOM_PRODUCTION_API_BASE_URL,
  BREATH_ROOM_PRODUCTION_WS_URL,
  getBreathRoomApiBaseUrl,
  getBreathRoomWsUrl,
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

describe("getBreathRoomApiBaseUrl", () => {
  const prevRoom = process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
  const prevWs = process.env.EXPO_PUBLIC_WS_URL;
  const prevApi = process.env.EXPO_PUBLIC_API_BASE_URL;

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
    if (prevApi === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = prevApi;
    }
  });

  it("uses EXPO_PUBLIC_API_BASE_URL when set", () => {
    delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    delete process.env.EXPO_PUBLIC_WS_URL;
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:9999/";
    expect(getBreathRoomApiBaseUrl()).toBe("http://localhost:9999");
  });

  it("derives http from ws URL when API base unset", () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_WS_URL = "ws://localhost:8085";
    expect(getBreathRoomApiBaseUrl()).toBe("http://localhost:8085");
  });

  it("derives https from wss URL", () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_WS_URL = "wss://example.com/path";
    expect(getBreathRoomApiBaseUrl()).toBe("https://example.com");
  });

  it("uses production API host when env unset (matches default ws)", () => {
    delete process.env.EXPO_PUBLIC_BREATH_ROOM_WS_URL;
    delete process.env.EXPO_PUBLIC_WS_URL;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(getBreathRoomWsUrl()).toBe(BREATH_ROOM_PRODUCTION_WS_URL);
    expect(getBreathRoomApiBaseUrl()).toBe(BREATH_ROOM_PRODUCTION_API_BASE_URL);
  });
});
