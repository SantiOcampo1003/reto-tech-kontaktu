import Link from "next/link";

export default function ContactNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">Contacto no encontrado</h1>
      <p className="mt-2 text-sm text-muted">Puede que el enlace sea incorrecto o que el contacto ya no exista.</p>
      <Link href="/contacts" className="mt-6 inline-block text-sm font-medium text-accent">
        ← Volver al listado
      </Link>
    </main>
  );
}
