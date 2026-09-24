const PATHS = {
  today: "M12 3v2M12 19v2M4.2 7l1.7 1M18.1 15l1.7 1M4.2 17l1.7-1M18.1 9l1.7-1M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z",
  session: "M6 4h9l3 3v13H6zM9 11h6M9 15h4",
  roadmap: "M4 6.5 9 4l6 2.5L20 4v13.5L15 20l-6-2.5L4 20zM9 4v13.5M15 6.5V20",
  skills: "M12 3 20 7.5v9L12 21 4 16.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  mentor: "M5 5h14v10H9l-4 4zM9 9.5h6M9 12h4",
  plus: "M12 5v14M5 12h14",
  mic: "M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v3",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "more" ? 3 : name === "plus" ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The Venture Forge mark: a forged "V" under a hammer-line. Also used for the app icon. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#15181f" />
      <path d="M20 16h24" stroke="#cfa25a" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <path d="M19 24l13 25 13-25" fill="none" stroke="#cfa25a" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
