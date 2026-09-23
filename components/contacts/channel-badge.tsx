import type { NormalizedChannel } from "@/types/contact";

export function ChannelBadge({ channel }: { channel: NormalizedChannel }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs font-medium text-muted">
      {channel.label}
    </span>
  );
}
