"use client";

import { GuestMeetingSession } from "@/components/meeting/guest-meeting-session";
import { useParams } from "next/navigation";

/**
 * Next.js can reuse this client component when only `[id]` changes, which leaves
 * joined/stream/name state from the previous meeting. Remount per meeting id.
 */
export default function GuestMeetingPage() {
  const params = useParams();
  const meetingId = params.id as string;
  return <GuestMeetingSession key={meetingId} meetingId={meetingId} />;
}
