# Guía de incorporación — Integrante 2 (Spec 2: Gamification Service)

> **Rol:** Dueño de la Spec 2 — `specs/openapi/gamification-service.yaml`  
> **Rama de trabajo:** `feature/spec-2`  
> **NO tocar:** `main`, `feature/spec-3`, ni los archivos del Spec 1 o Spec 4

---

## 1. Requisitos previos

Instala estas herramientas antes de empezar:

```powershell
# Node.js 20+ (https://nodejs.org)
node --version  # debe ser >= 20

# pnpm
npm install -g pnpm

# Git
git --version
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/MathLeoYa/ArtesVivas.git
cd ArtesVivas
```

---

## 3. Crear tu rama de trabajo

```bash
# NUNCA trabajes en main directamente
git checkout -b feature/spec-2
git push -u origin feature/spec-2
```

---

## 4. Crear tu archivo de spec

```bash
# Crear el directorio si no existe
mkdir -p specs/openapi

# Tu archivo vive aquí:
# specs/openapi/gamification-service.yaml
```

Copia el template que Mateo te entregó (ver sección 6) y guárdalo en esa ruta.

---

## 5. Validar tu spec con Spectral (linter)

```bash
# Instalar dependencias
pnpm install

# Validar la spec
pnpm run lint:specs
```

El CI también lo hace automáticamente cuando abres un PR — pero es mejor validar antes de hacer push.

---

## 6. Tu spec de partida (template completo)

El archivo `specs/openapi/gamification-service.yaml` que debes crear tiene este contenido base:

**Endpoints a implementar:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/passport/stamp` | Sellar visita a escenario (geolocalización GPS requerida) |
| `GET` | `/api/v1/passport/{userId}` | Ver pasaporte cultural completo |
| `POST` | `/api/v1/votes` | Emitir voto/aplauso para evento en curso |
| `GET` | `/api/v1/votes/live/{eventId}` | Conteo en vivo del Aplausómetro |
| `GET` | `/api/v1/rankings/events` | Top eventos más aplaudidos |
| `GET` | `/api/v1/rankings/users` | Top exploradores del festival |
| `GET` | `/api/v1/badges` | Catálogo de badges |
| `GET` | `/api/v1/badges/{userId}` | Badges desbloqueados por usuario |

**Eventos de dominio que tu servicio emite (via Redis Pub/Sub):**
- `VoteCast` → el Telemetry Service retransmite conteo en vivo via WebSocket
- `StampEarned` → se emite cuando un usuario obtiene un sello
- `BadgeUnlocked` → se emite cuando un usuario desbloquea un badge

**Reglas de negocio clave:**
- 1 voto por usuario por evento (aplicar `409 VOTE_ALREADY_CAST`)
- Para votar: usuario debe estar dentro de 200m del evento
- Para sellar: usuario debe estar dentro de 100m del escenario

> **Pide el archivo completo a Mateo** — tiene el YAML completo con todos los schemas, ejemplos y respuestas de error ya redactados.

---

## 7. Flujo de trabajo diario (GitKraken o CLI)

```bash
# Asegurarte de estar en tu rama
git checkout feature/spec-2

# Jalar cambios de main (por si Mateo actualizó algo)
git fetch origin
git merge origin/main

# Trabajar en tu spec...

# Commitear con mensaje semántico
git add specs/openapi/gamification-service.yaml
git commit -m "feat(spec2): agregar endpoint de votación con geofence"

# Subir a GitHub
git push origin feature/spec-2
```

---

## 8. Abrir Pull Request cuando estés listo

1. Ve a: https://github.com/MathLeoYa/ArtesVivas
2. Clic en **"Compare & pull request"** para tu rama `feature/spec-2`
3. Base: `main` ← Compare: `feature/spec-2`
4. Título: `feat(spec2): Gamification Service OpenAPI — Pasaporte Cultural + Aplausómetro`
5. Llena el checklist del template de PR
6. Asigna a **Mateo** como reviewer

> ⚠️ El CI validará automáticamente tu spec con Spectral. Si falla, revisa los errores y vuelve a hacer push.

---

## 9. ¿Qué NO hacer?

- ❌ No hagas commit en `main`
- ❌ No modifiques `specs/openapi/catalog-service.yaml` (es de Mateo)
- ❌ No modifiques `specs/asyncapi/live-events-stream.yaml` (es del Integrante 3)
- ❌ No toques `specs/features/*.feature` (Spec 4, es de Mateo)

---

## 10. Contacto y dependencias

| Spec | Dueño | Rama |
|------|-------|------|
| Spec 1 (Catalog OpenAPI) | Mateo | `main` |
| **Spec 2 (Gamification OpenAPI)** | **Tú** | `feature/spec-2` |
| Spec 3 (AsyncAPI Live Stream) | Integrante 3 | `feature/spec-3` |
| Spec 4 (Gherkin BDD) | Mateo | `main` |

Tu spec referencia eventos del Spec 1 (IDs de eventos para votación) y es consumida por el Spec 3 (el canal `liveVoteCount` del WebSocket usa los datos que tu servicio emite).
