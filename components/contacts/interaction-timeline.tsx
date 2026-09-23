import type { InteractionViewModel } from "@/types/contact";

const DIRECTION_LABEL: Record<InteractionViewModel["direction"], string> = {
  inbound: "Entrante",
  outbound: "Saliente",
  unknown: "",
};

function InteractionItem({ interaction }: { interaction: InteractionViewModel }) {
  return (
    <li className="border-l-2 border-border pl-4">
      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
        <span className="font-medium text-foreground">{interaction.channel.label}</span>
        {DIRECTION_LABEL[interaction.direction] && <span>· {DIRECTION_LABEL[interaction.direction]}</span>}
        <span>· {interaction.date.valid ? interaction.date.display : "Fecha no disponible"}</span>
        {interaction.durationLabel && <span>· {interaction.durationLabel}</span>}
      </div>

      <p className="mt-1 text-sm text-foreground">{interaction.summary}</p>

      {interaction.formInfo?.propertyRef && (
        <p className="mt-1 text-xs text-muted">Ref. propiedad: {interaction.formInfo.propertyRef}</p>
      )}

      {interaction.transcript && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs font-medium text-accent">Ver transcripción</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-background p-3 text-xs text-muted">
            {interaction.transcript}
          </pre>
        </details>
      )}
    </li>
  );
}

export function InteractionTimeline({ interactions }: { interactions: InteractionViewModel[] }) {
  if (interactions.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Interacciones</h2>
        <p className="mt-3 text-sm text-muted">Sin interacciones registradas.</p>
      </section>
    );
  }

  // interactions arrive chronologically ascending; show most recent first.
  const ordered = [...interactions].reverse();

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Interacciones</h2>
      <ol className="mt-4 space-y-4">
        {ordered.map((interaction) => (
          <InteractionItem key={interaction.id} interaction={interaction} />
        ))}
      </ol>
    </section>
  );
}
