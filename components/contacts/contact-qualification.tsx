import type { QualificationFactViewModel, QualificationGroupViewModel, QualificationSourceKind } from "@/types/contact";

const SOURCE_COLOR: Record<QualificationSourceKind, string> = {
  human: "text-success",
  ai: "text-accent",
  import: "text-muted",
  unknown: "text-muted-soft",
};

function QualificationFact({ fact }: { fact: QualificationFactViewModel }) {
  return (
    <li className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="text-sm text-muted">{fact.label}</p>
        <p className="text-sm font-medium text-foreground">{fact.displayValue}</p>
      </div>
      <div className="shrink-0 text-right text-xs">
        <p className={SOURCE_COLOR[fact.sourceKind]}>{fact.sourceLabel}</p>
        {fact.date.valid && <p className="text-muted-soft">{fact.date.display}</p>}
      </div>
    </li>
  );
}

export function ContactQualification({ groups }: { groups: QualificationGroupViewModel[] }) {
  if (groups.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Cualificación</h2>
        <p className="mt-3 text-sm text-muted">Sin cualificación registrada todavía.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Cualificación</h2>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
            <ul className="mt-1 divide-y divide-border">
              {group.facts.map((fact) => (
                <QualificationFact key={fact.key} fact={fact} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
