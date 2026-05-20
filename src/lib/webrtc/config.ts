/**
 * WebRTC config entry — delegates to ice-config (STUN + TURN).
 */

export {
  buildIceServers,
  getRtcConfiguration,
  getIceDiagnostics,
  getIceRestartMaxAttempts,
  getIceDisconnectGraceMs,
  isTurnOnlyTestMode,
  type IceDiagnostics,
} from "./ice-config";

import { getRtcConfiguration } from "./ice-config";

/** Legacy export — prefer getRtcConfiguration() for new code. */
export const DEFAULT_RTC_CONFIG = getRtcConfiguration();
