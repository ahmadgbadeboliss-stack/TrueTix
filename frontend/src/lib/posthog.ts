import posthogJs, { type PostHog } from "posthog-js";
import { POSTHOG_HOST, POSTHOG_KEY } from "./env";

// A no-op stand-in so the app can call posthog.capture(...) everywhere
// without null-checking, in case the project isn't configured locally.
const noop: Pick<PostHog, "capture" | "identify" | "reset"> = {
  capture: () => undefined as never,
  identify: () => undefined as never,
  reset: () => undefined as never,
};

export const posthog: Pick<PostHog, "capture" | "identify" | "reset"> = POSTHOG_KEY
  ? posthogJs.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_exceptions: true,
      autocapture: true,
    }) ?? noop
  : noop;
