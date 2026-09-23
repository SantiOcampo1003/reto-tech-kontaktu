"use client";

export default function ContactsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">No se pudo cargar el listado</h1>
      <p className="mt-2 text-sm text-muted">Ha ocurrido un error inesperado. Puedes intentarlo de nuevo.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
      >
        Reintentar
      </button>
    </main>
  );
}
