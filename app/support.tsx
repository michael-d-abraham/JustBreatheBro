import { Redirect } from "expo-router";

/**
 * Legacy route: support lives in `SupportSheet` (opened from the header on main screens).
 * Keep this so `/support` deep links and an empty file previously registered as a route
 * resolve without a missing-default-export error.
 */
export default function SupportRedirect() {
  return <Redirect href="/" />;
}
