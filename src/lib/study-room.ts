/** Room codes: readable, no 0/O/1/I/L confusion */
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6): string {
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let s = "";
  for (let i = 0; i < length; i++) {
    s += CODE_CHARS[arr[i] % CODE_CHARS.length];
  }
  return s;
}

/** Custom WebRTC meeting (replaces legacy Jitsi voice route). */
export function getStudyRoomMeetingPath(roomCode: string): string {
  const safe = roomCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `/study/room/${safe}/meeting`;
}

/** Full shareable URL that drops the user straight into the video meeting. */
export function getStudyRoomMeetingUrl(roomCode: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://btechverse.cloud";
  return `${origin}${getStudyRoomMeetingPath(roomCode)}`;
}

/** @deprecated Use getStudyRoomMeetingPath — redirects from old /voice URLs */
export function getStudyRoomVoicePath(roomCode: string): string {
  return getStudyRoomMeetingPath(roomCode);
}

export const STUDY_ROOMS_COLLECTION = "studyRooms";
export const STUDY_MESSAGES_SUBCOLLECTION = "messages";
