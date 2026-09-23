import type { DataHealthViewModel } from "@/types/contact";

export function DataHealth({ health }: { health: DataHealthViewModel }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Salud del contacto</h2>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-accent" style={{ width: `${health.score}%` }} />
        </div>
        <span className="text-sm font-semibold text-foreground">{health.score}%</span>
      </div>

      {health.missing.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted">Falta:</p>
          <ul className="mt-1 space-y-1 text-sm text-foreground">
            {health.missing.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-success">Ficha completa</p>
      )}

      <p className="mt-4 text-xs text-muted-soft">
        Mide qué tan accionable es el contacto para un agente, no la &quot;calidad&quot; del dato.
      </p>
    </section>
  );
}
