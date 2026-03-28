"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchJSON } from "./fetch-json";
import type { Meeting, MeetingUtterance, MeetingSentiment } from "@/lib/supabase/types";

interface MeetingDetailResponse {
  meeting: Meeting;
  utterances: MeetingUtterance[];
  sentiments: MeetingSentiment[];
}

export function useMeetingDetail(meetingId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["meeting", meetingId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchJSON<MeetingDetailResponse>(`/api/meeting/${meetingId}`),
    enabled: !!meetingId,
  });

  /** Append a single utterance to the cached data (for realtime updates). */
  const appendUtterance = useCallback(
    (row: MeetingUtterance) => {
      queryClient.setQueryData<MeetingDetailResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, utterances: [...old.utterances, row] };
      });
    },
    [queryClient, queryKey],
  );

  /** Append a single sentiment to the cached data (for realtime updates). */
  const appendSentiment = useCallback(
    (row: MeetingSentiment) => {
      queryClient.setQueryData<MeetingDetailResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, sentiments: [...old.sentiments, row] };
      });
    },
    [queryClient, queryKey],
  );

  /** Update the meeting record in cache (for realtime updates). */
  const updateMeeting = useCallback(
    (meeting: Meeting) => {
      queryClient.setQueryData<MeetingDetailResponse>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, meeting };
      });
    },
    [queryClient, queryKey],
  );

  return {
    ...query,
    meeting: query.data?.meeting ?? null,
    utterances: query.data?.utterances ?? [],
    sentiments: query.data?.sentiments ?? [],
    appendUtterance,
    appendSentiment,
    updateMeeting,
  };
}
