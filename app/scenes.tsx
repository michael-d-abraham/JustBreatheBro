import { Redirect } from "expo-router";

/**
 * Legacy route: Scenes lives in `ScenesSheet` (opened from the header on home).
 */
export default function ScenesRedirect() {
  return <Redirect href="/" />;
}
