import type { PreCallViewModel } from "@/types/contact";

export function PreCallCard({ preCall }: { preCall: PreCallViewModel }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Antes de llamar</h2>
      <p className="mt-2 text-base text-foreground">{preCall.headline}</p>

      {preCall.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {preCall.warnings.map((warning) => (
            <li key={warning} className="text-sm font-medium text-danger">
              ⚠ {warning}
            </li>
          ))}
        </ul>
      )}

      {preCall.facts.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {preCall.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-muted">{fact.label}</dt>
              <dd className="text-sm font-medium text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {preCall.sparse && (
        <p className="mt-3 text-sm text-muted">
          La primera conversación debería ayudar a conocer: operación, zona y presupuesto.
        </p>
      )}

      {preCall.lastContact && (
        <p className="mt-4 text-xs text-muted-soft">Último contacto: {preCall.lastContact.label}</p>
      )}
    </section>
  );
}
