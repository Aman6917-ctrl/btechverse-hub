/**
 * Helpers to distinguish camera vs display (screen) tracks.
 * Display tracks from getDisplayMedia expose displaySurface in getSettings().
 */

export function isScreenShareTrack(track: MediaStreamTrack | null | undefined): boolean {
  if (!track || track.kind !== "video") return false;
  try {
    const settings = track.getSettings();
    return (
      settings.displaySurface === "monitor" ||
      settings.displaySurface === "window" ||
      settings.displaySurface === "browser" ||
      settings.displaySurface === "application"
    );
  } catch {
    return track.label.toLowerCase().includes("screen");
  }
}
