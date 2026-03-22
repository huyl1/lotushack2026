/**
 * Mute/unmute the local microphone for a live getUserMedia stream.
 * Disabling audio tracks stops audio to WebRTC peers and to the transcription pipeline.
 */
export function setLocalMicMuted(
  stream: MediaStream | null,
  muted: boolean,
): void {
  if (!stream) return;
  for (const track of stream.getAudioTracks()) {
    track.enabled = !muted;
  }
}

export function isLocalMicMuted(stream: MediaStream | null): boolean {
  if (!stream) return false;
  const audio = stream.getAudioTracks();
  if (audio.length === 0) return false;
  return audio.every((t) => !t.enabled);
}
