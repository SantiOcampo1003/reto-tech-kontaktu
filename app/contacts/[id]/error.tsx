"use client";

import Link from "next/link";

export default function ContactError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">No se pudo cargar el contacto</h1>
      <p className="mt-2 text-sm text-muted">Ha ocurrido un error inesperado. Puedes intentarlo de nuevo.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
        >
          Reintentar
        </button>
        <Link
          href="/contacts"
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
        >
          Volver al listado
        </Link>
      </div>
    </main>
  );
}
