const PATHS = {
  today: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5",
  session: "M5 4h10l4 4v12H5zM15 4v4h4M8.5 12h7M8.5 16h5",
  projects: "M4 7h16v12H4zM9 7V5h6v2",
  evidence: "M5 12.5 10 17.5 19.5 7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === "more" ? 3 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
