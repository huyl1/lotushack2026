export const MEETING_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "singlish", label: "Singlish" },
  { value: "chinese", label: "Chinese" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "thai", label: "Thai" },
  { value: "indonesian", label: "Indonesian" },
] as const;

export type MeetingLanguage = (typeof MEETING_LANGUAGES)[number]["value"];
