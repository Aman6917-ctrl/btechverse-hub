/**
 * WebRTC config entry — delegates to ice-config (STUN + TURN).
 */

export {
  buildIceServers,
  getRtcConfiguration,
  resolveIceServers,
  resolveRtcConfiguration,
  getIceDiagnostics,
  getIceConnectivityResult,
  setIceConnectivityResult,
  getIceRestartMaxAttempts,
  getIceDisconnectGraceMs,
  isTurnOnlyTestMode,
  type IceDiagnostics,
} from "./ice-config";

export { runIceConnectivityTest, type IceConnectivityResult } from "./ice-connectivity";
export { parseIceProviders, type IceProviderId } from "./ice-providers";

import { getRtcConfiguration } from "./ice-config";

/** Legacy export — prefer getRtcConfiguration() for new code. */
export const DEFAULT_RTC_CONFIG = getRtcConfiguration();
