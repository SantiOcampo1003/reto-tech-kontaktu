# Kontaktu — Ficha de contacto

Reto técnico: ficha de contacto para un CRM inmobiliario AI-first, construida sobre un dataset deliberadamente heterogéneo (`contactos.json`).

## Running locally

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` (redirige a `/contacts`). Requiere Node ≥ 18.18 (probado con Node 18.20).

```bash
npm run build   # type-check + build de producción
npm run lint    # ESLint
```

## What I built

- Listado de contactos (`/contacts`) — auxiliar, sin filtros ni paginación.
- Ficha de contacto (`/contacts/[id]`) — la pantalla protagonista: cabecera de identidad, vista "antes de llamar", cualificación agrupada y schema-light, timeline de interacciones, y salud del dato.
- `GET /api/contacts` y `GET /api/contacts/[id]` como route handlers (con 300ms de latencia simulada) — el JSON nunca se importa directamente desde un componente.
- Estados: loading (skeletons), error (con retry), 404, y una ficha completa para el contacto más vacío del dataset.

## Architecture

```
contactos.json
  → lib/contacts/data.ts            (lee el fichero, hace de "datastore")
  → app/api/contacts/**             (route handlers, sirven JSON normalizado)
  → lib/contacts/normalize-*.ts     (funciones puras: raw → view model)
  → components/contacts/*.tsx       (solo consumen view models, nunca raw)
```

Los componentes de UI no conocen la forma cruda del dataset — solo los tipos de `types/contact.ts` (`ContactViewModel`, `QualificationFactViewModel`, etc.), que ya vienen con nulls resueltos, fechas parseadas y teléfonos validados.

## Data normalization

Cada normalizador es una función pura en `lib/contacts/`, testeada manualmente contra los 16 contactos reales (ver "Edge cases"):

- `normalize-phone.ts` — limpia separadores, detecta `+34`/`0034`/nacional sin prefijo, valida contra el patrón de móvil español (`[67]XXXXXXXX`), genera `tel:`/`wa.me` solo si es válido.
- `normalize-date.ts` — parsea ISO 8601, `DD/MM/YYYY[ HH:mm]` y timestamps unix en segundos (el dataset mezcla los tres). Nunca lanza ni produce `Invalid Date`; expone `parseDate` para quien necesite el `Date` crudo (usado por el ordenamiento del timeline y por `resolveQualificationFact`).
- `normalize-channel.ts` — mapea todas las grafías vistas (`VOICE_CALL`/`llamada`/`VOZ`, `WHATSAPP`/`whatsapp`, `WITEI`/`CRM` como importaciones…) a un enum canónico con etiqueta legible.
- `normalize-name.ts` — normaliza mayúsculas/minúsculas solo para mostrar (nunca muta el dato crudo), y resuelve identidad con fallback nombre → teléfono → email → "Contacto sin identificar".
- `qualification.ts` — el módulo más importante. Parsea `qualification_data` sea objeto, `null`, o **string JSON serializado** (caso real: c-003). Agrupa por `sale`/`rental`/`shared` → Compra/Alquiler/Comunes; cualquier grupo o campo suelto que no reconozca (caso real: los `income_*` sueltos de c-008) cae en "Otros" sin romper nada. `formatQualificationValue` renderiza cualquier tipo (string/number/boolean/array/object/null) sin `any`, con un caso especial no-key-specific para la forma `{max}`/`{min,max}` ("Hasta X" / "Entre X y Y"). `resolveQualificationFact` aplica la regla **humano > IA > importado > desconocido**, y a igualdad de origen gana el más reciente.
- `contact-health.ts` / `pre-call.ts` — construyen los view models de las dos user stories basadas en reglas (ver abajo).

## Decisions

- **Identidad:** nombre válido → teléfono legible → email → "Contacto sin identificar". Nunca se pinta `null`/`undefined` como identidad.
- **Teléfono:** se asume país por defecto España (`+34`) cuando no hay prefijo, porque es el único país presente en el dataset — no se inventó soporte multi-país.
- **Cualificación schema-light:** la UI itera `Object.entries` de cada grupo, nunca referencia una clave por nombre salvo para el pequeño diccionario de labels conocidos (`humanizeKey`) y para las dos búsquedas de "zona"/"presupuesto" del data health y del pre-call — ambas por coincidencia de substring, no por dependencia estructural.
- **Override humano gana:** implementado como ranking (`human=3 > import=2 > ai=1 > unknown=0`) sobre `resolveQualificationFact`. El dataset de hoy nunca trae dos versiones del mismo hecho — solo el valor final con su `source` — así que la regla de precedencia está codificada y lista, pero no había un conflicto real que forzara la rama "hay dos candidatos" en producción.
- **Timeline:** todas las fechas pasan por `normalizeDate`/`parseDate` antes de comparar; nunca se ordena el string crudo.
- **Contacto disperso (c-012):** sin nombre, sin `lead_source`, `created_at` como timestamp numérico, sin qualification, sin interacciones. La ficha sigue siendo usable: identidad cae a teléfono, salud del dato marca 25%, y "antes de llamar" muestra el mensaje de información limitada en vez de una pantalla vacía.
- **Salud del dato ("accionable", no "calidad"):** 5 criterios transparentes y con pesos documentados en `contact-health.ts` — Identidad 20, Contacto válido 25, Necesidad identificada 25, Zona 15, Presupuesto 15. Se muestra siempre el desglose de lo que falta, nunca solo un porcentaje.
- **Antes de llamar:** reglas deterministas, sin LLM — titular a partir de operación+zona, hasta 5 hechos curados, último contacto relativo, y advertencias de seguridad (ver siguiente punto).
- **Señales de seguridad no pedidas explícitamente pero presentes en el dataset:** el tag `no-llamar` (c-013) bloquea los botones de Llamar/WhatsApp en la cabecera y aparece como advertencia en "antes de llamar"; `ai_handoff` (c-016, cliente molesto pidiendo humano) se muestra como aviso. No implementé la user story completa de "Cumplimiento" — esto es una guarda mínima añadida a las 3 historias elegidas, no una historia nueva.
- **`is_test: true` (c-014) y `organization_id` mixto (c-010/c-011 en `ORG-0047` vs el resto en `ORG-0031`):** no se filtran ni se tratan de forma especial — no estaba en el spec y hubiera sido inventar requisitos. Documentado aquí para que quede explícito que se detectaron.
- **Diseño sin guía:** `guia-diseno-kontaktu.md` y las 3 imágenes de referencia no estaban disponibles en el entorno. Se lo señalé al usuario antes de tocar UI; decidimos seguir con un criterio propio — paleta neutra (`app/globals.css`), sin gradients/glassmorphism/sombras marcadas, bordes finos y alta densidad de información tipo CRM. Si aparecen los assets reales, solo hay que tocar los tokens CSS.

## User stories selected

1. **Teléfonos siempre bien** — el dataset trae 6+ formatos reales de un mismo tipo de número; normalizarlo desbloquea acciones reales (llamar/WhatsApp) y es la base para respetar `no-llamar`.
2. **Salud del dato** — hay contactos desde "solo teléfono" hasta muy ricos; sin un indicador transparente, un agente no puede priorizar su día.
3. **Vista "antes de llamar"** — el dataset tiene señales operativas reales (override manual de presupuesto, cliente pidiendo humano, contacto disperso) que un agente necesita ver en 10 segundos, no leyendo toda la ficha.

Descartadas conscientemente (no por falta de valor, sino por foco): duplicados, edición de cualificación, matching de propiedades, búsqueda avanzada, siguiente-mejor-acción con LLM, resumen ejecutivo con LLM, cumplimiento como historia completa, bonus de voz LiveKit.

## Edge cases (dataset real, no hipotéticos)

- Teléfonos: `+34 655 12 34 56`, `0034612889034`, `699112233` (sin prefijo), `+34-644-556-677`, `null`.
- Fechas: ISO 8601, `"11/07/2026"`, `"11/07/2026 18:42"`, timestamp unix en segundos como número (`1782259200`, c-012).
- `qualification_data` como **string JSON doblemente serializado** (c-003).
- Campos sueltos de cualificación fuera de `qualification` (`net_income`, `income_verified`, …, c-008).
- Mismo campo con tipos distintos entre contactos: `budget` como number, string ("1.100 €") u objeto `{max}`; `zones` como array o string libre; `has_pets` como boolean o frase libre.
- Nombres en MAYÚSCULAS (c-002, c-015), en minúsculas (c-009), abreviados ("David P."), o `null` (c-004, c-012).
- Canal repetido con distinta grafía: `VOICE_CALL`/`llamada`/`VOZ`; `WHATSAPP`/`whatsapp`.
- Posible duplicado real: c-001 "Carmen Ruiz Delgado" (+34655123456) y c-009 "carmen ruiz" (655123456) son, muy probablemente, la misma persona — detectado pero no resuelto (fuera de las 3 historias elegidas).
- `email: "mdolores@@gmail.com"` (c-015) — email con doble `@`, tratado como inválido por `contact-health.ts` en vez de asumirlo válido porque el campo no es null.

## Working with AI

Claude Code se usó para:

- Inspeccionar el dataset real (`contactos.json`) contacto por contacto antes de escribir ningún tipo o función, y producir un informe de edge cases previo a la implementación (fases separadas, sin código hasta cerrar el análisis).
- Escribir los tipos raw/view-model y toda la capa de normalización (`lib/contacts/*.ts`).
- Levantar el proyecto Next.js y verificar la normalización corriendo el servidor real y haciendo `curl` a los 16 IDs reales del dataset (no datos sintéticos), inspeccionando casos concretos (c-003, c-008, c-012, c-013, c-016) en la respuesta JSON.
- Construir la UI y validarla visualmente con capturas de pantalla reales (Playwright headless) de los 4 estados clave: listado, contacto rico, contacto disperso, y 404 — no solo "compila y pasa lint".
- Revisar el propio trabajo contra los 9 requisitos del tech spec antes de darlo por terminado.

## Where Claude got it wrong

- **Bug real, detectado solo al mirar la pantalla:** `formatRelative` pluralizaba "mes" como `mes + "s"` = **"mess"** en vez de "meses". Pasó el build, el lint y el type-check sin avisar — solo se vio al capturar la ficha de Carmen Ruiz Delgado y leer "hace 2 mess". Se corrigió con un caso especial para "mes"→"meses" en `lib/contacts/normalize-date.ts`. Lección: pluralización en español no es mecánica, y ningún chequeo automático de TypeScript la detecta — hace falta mirar el render real.
- **Error operativo al validar, no en el código de producción:** al hacer `curl` a los 16 contactos para comprobar que la normalización no lanzaba excepciones, generé IDs con `seq -w 1 16` (`c-01`…`c-16`), que no coinciden con el formato real del dataset (`c-001`…`c-016`, 3 dígitos). Los 16 requests devolvieron 404 y por un momento pareció que la API estaba rota; el problema era el script de verificación, no la app. Se corrigió el padding y se repitió la comprobación.
- **Falsa alarma, no un bug:** `Intl.NumberFormat('es-ES').format(3200)` devuelve `"3200"` sin separador de miles, mientras que `350000` da `"350.000"`. Al principio pareció una inconsistencia en `formatQualificationValue`, pero es el comportamiento real y correcto de CLDR reciente para español (agrupación "min2": no se separan los primeros 4 dígitos). Se verificó con un script de Node antes de "arreglar" algo que no estaba roto.

## What I intentionally didn't build

Base de datos real, autenticación, gestión de estado (Redux/Zustand), fusión de duplicados, edición de hechos de cualificación, búsqueda/filtros en el listado, siguiente-mejor-acción y resumen ejecutivo con LLM, matching contra `kb-propiedades-voz.json`, cumplimiento como flujo completo (solo la guarda mínima de `no-llamar` descrita arriba), tests E2E, dark mode, y el bonus de agente de voz en LiveKit. Todo por foco de tiempo, no por desconocimiento del requisito — están listados en el propio tech spec como historias abiertas que exceden las 2–3 elegidas.

## What I would do with one more day

- Traer la guía de diseño real de Kontaktu y re-skinear sobre los mismos tokens CSS (el resto de la UI no debería necesitar cambios estructurales).
- Tests unitarios para `normalize-phone`/`normalize-date`/`qualification.ts` — son funciones puras, perfectas para testear, y hoy solo están validadas manualmente contra el dataset real.
- Detección de duplicados (c-001/c-009 es un caso real) con una vista de fusión propuesta, sin auto-merge.
- Edición de un hecho de cualificación con su propio registro de override, reutilizando el mismo `sourceKind` que ya existe para mostrar procedencia.
- Persistir `qualification_data` en algo real (hoy es un fichero leído en memoria) para que la edición anterior tenga sentido.
