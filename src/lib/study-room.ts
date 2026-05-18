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

/** Stable Jitsi room name for a Btechverse study room code */
export function getJitsiRoomName(roomCode: string): string {
  const safe = roomCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `BtechverseStudy${safe}`;
}

/** Direct meet.jit.si link (legacy). Prefer /study/room/:id/voice for hangup → site redirect. */
export function getJitsiRoomUrl(roomCode: string): string {
  const name = getJitsiRoomName(roomCode);
  return `https://meet.jit.si/${encodeURIComponent(name)}#config.prejoinPageEnabled=false`;
}

export function getStudyRoomVoicePath(roomCode: string): string {
  const safe = roomCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `/study/room/${safe}/voice`;
}

export const STUDY_ROOMS_COLLECTION = "studyRooms";
export const STUDY_MESSAGES_SUBCOLLECTION = "messages";
