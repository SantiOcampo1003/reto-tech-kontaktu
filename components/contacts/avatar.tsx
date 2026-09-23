const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function ContactAvatar({
  initials,
  hasName,
  size = "md",
}: {
  initials: string;
  hasName: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <div
      className={`flex ${SIZES[size]} shrink-0 items-center justify-center rounded-full font-semibold ${
        hasName ? "bg-accent-soft text-accent" : "bg-border text-muted"
      }`}
    >
      {initials}
    </div>
  );
}
