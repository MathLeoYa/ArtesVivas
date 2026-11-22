# Guía de incorporación — Integrante 3 (Spec 3: AsyncAPI Live Stream)

> **Rol:** Dueño de la Spec 3 — `specs/asyncapi/live-events-stream.yaml`  
> **Rama de trabajo:** `feature/spec-3`  
> **NO tocar:** `main`, `feature/spec-2`, ni los archivos del Spec 1 o Spec 4

---

## 1. Requisitos previos

```powershell
node --version  # >= 20
npm install -g pnpm
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
git checkout -b feature/spec-3
git push -u origin feature/spec-3
```

---

## 4. Crear tu archivo de spec

```bash
mkdir -p specs/asyncapi
# Tu archivo vive en:
# specs/asyncapi/live-events-stream.yaml
```

---

## 5. Validar tu spec con AsyncAPI CLI

```bash
pnpm install
pnpm run lint:specs
```

El CI usa `asyncapi-cli` para validar `specs/asyncapi/*.yaml` automáticamente.

---

## 6. Tu spec de partida — qué debe definir

Tu spec es una **AsyncAPI 3.0** que define los canales WebSocket del festival.

**Canales a documentar:**

| Canal (address) | Dirección | Descripción |
|----------------|-----------|-------------|
| `festival/events/updates` | Server → Client | Actualizaciones de estado de eventos |
| `festival/venues/{venueId}/capacity` | Server → Client | Semáforo de aforo por escenario |
| `festival/votes/live/{eventId}` | Server → Client | Aplausómetro en tiempo real |
| `festival/alerts/weather` | Server → Client | Alertas meteorológicas (lluvia, granizo) |
| `festival/flash/nearby` | Server → Client | Flash-performances cercanas (geocerca) |
| `client/location/update` | Client → Server | Ping de posición GPS del usuario |

**Protocolo:** WebSocket (`ws://` local, `wss://` producción via Traefik)  
**Autenticación:** JWT como query param: `wss://api.pulsaloja.ec/live?token=<JWT>`

**Flujo de datos en la arquitectura:**
```
Catalog Service  ──── PUBLISH "events.flash.started" ──▶ Redis Pub/Sub
Gamification Svc ──── PUBLISH "gamification.votes.*" ──▶ Redis Pub/Sub
                                                              │
                                                              ▼
                                                   Live Tracking Service
                                                   (subscrito a Redis)
                                                              │
                                                              ▼
                                              WebSocket Hub ──▶ Clientes PWA
```

**Tu servicio NO escribe a base de datos** — solo retransmite eventos de Redis a clientes WebSocket.

**Mensajes clave a definir con sus schemas:**
- `EventUpdateMessage` → evento del catálogo cambió estado/ubicación
- `CapacityUpdateMessage` → aforo de un escenario cambió nivel (verde/amarillo/rojo)
- `LiveVoteCountMessage` → nuevo voto registrado en el aplausómetro
- `WeatherAlertMessage` → alerta climática con escenarios alternativos cubiertos
- `FlashPerformanceAlertMessage` → flash-performance cercana al usuario (con distancia en metros)
- `UserLocationPingMessage` → mensaje que el CLIENT envía con sus coordenadas GPS

> **Pide el archivo completo a Mateo** — tiene el YAML completo con todos los schemas, ejemplos y operaciones ya redactadas.

---

## 7. Flujo de trabajo diario

```bash
git checkout feature/spec-3

# Jalar cambios de main
git fetch origin
git merge origin/main

# Trabajar en tu spec...

git add specs/asyncapi/live-events-stream.yaml
git commit -m "feat(spec3): definir canal de alertas meteorologicas con venues alternativos"
git push origin feature/spec-3
```

---

## 8. Abrir Pull Request

1. https://github.com/MathLeoYa/ArtesVivas → **"Compare & pull request"**
2. Base: `main` ← Compare: `feature/spec-3`
3. Título: `feat(spec3): Live Tracking Service AsyncAPI — WebSocket channels`
4. Llena el checklist del PR template
5. Asigna a **Mateo** como reviewer

---

## 9. ¿Qué NO hacer?

- ❌ No hagas commit en `main`
- ❌ No modifiques `specs/openapi/catalog-service.yaml`
- ❌ No modifiques `specs/openapi/gamification-service.yaml`
- ❌ No toques `specs/features/*.feature`

---

## 10. Dependencias entre specs

Tu spec **consume** eventos de:
- **Spec 1** (Catalog): `EventCreated`, `EventUpdated`, `EventCancelled`, `FlashPerformanceStarted`, `EventRelocated`
- **Spec 2** (Gamification): `VoteCast`, `StampEarned`, `BadgeUnlocked`

Y **expone** los canales WebSocket que el frontend (React+Vite) consume.

| Spec | Dueño | Rama |
|------|-------|------|
| Spec 1 (Catalog OpenAPI) | Mateo | `main` |
| Spec 2 (Gamification OpenAPI) | Integrante 2 | `feature/spec-2` |
| **Spec 3 (AsyncAPI Live Stream)** | **Tú** | `feature/spec-3` |
| Spec 4 (Gherkin BDD) | Mateo | `main` |
