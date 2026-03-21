import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VALSEA live transcription demo",
  description: "Streaming speech-to-text via WebSocket (partial + final transcripts)",
};

export default function ValseaLiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
