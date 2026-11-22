# Arquitectura 4+1 Vistas — Pulso Loja (FIAVL)

> **Metodología:** Modelo de 4+1 Vistas de Philippe Kruchten  
> **Estilo arquitectónico:** Event-Driven Architecture (EDA) + Specification-Driven Development (SDD)  
> **Plataforma:** Festival Internacional de Artes Vivas de Loja — Ecuador

---

## Vista +1 — Escenarios (Casos de Uso)

La vista de escenarios captura los casos de uso más significativos del sistema. Sirve como eje integrador de las demás cuatro vistas.

**Actores:**
- **Visitante** — asistente anónimo al festival
- **Artista** — creador de flash performances espontáneas
- **Curador** — gestor oficial del catálogo de eventos
- **Administrador** — operador técnico con acceso total
- **Sistema Externo** — integraciones (OpenWeather, MapLibre GL)

```mermaid
flowchart TD
    V([Visitante])
    A([Artista])
    C([Curador])
    AD([Administrador])
    SE([Sistema Externo])

    V --> UC1["UC-1: Consultar catálogo\nde eventos del FIAVL"]
    V --> UC2["UC-2: Ver mapa interactivo\nde venues en Loja"]
    V --> UC3["UC-3: Recibir alertas\nen tiempo real (clima / aforo)"]
    A --> UC4["UC-4: Registrar flash\nperformance espontánea"]
    C --> UC5["UC-5: Gestionar eventos\n(crear / editar / cancelar)"]
    AD --> UC6["UC-6: Administrar usuarios\ny permisos del sistema"]
    SE --> UC7["UC-7: Proveedor de datos\nclimáticos y cartográficos"]

    UC1 --- CatalogSvc["Catalog Service\n(Spec 1 — OpenAPI)"]
    UC2 --- CatalogSvc
    UC3 --- LiveSvc["Live Tracking Service\n(Spec 3 — AsyncAPI)"]
    UC4 --- CatalogSvc
    UC4 --- LiveSvc
    UC5 --- CatalogSvc
    UC6 --- GamSvc["Gamification Service\n(Spec 2 — OpenAPI)"]
    UC7 --- LiveSvc
```

---

## Vista 1 — Lógica

La vista lógica muestra los principales elementos funcionales del sistema: Bounded Contexts, entidades de dominio y sus relaciones.

**Bounded Contexts:**
- **CatalogContext** — Gestión del catálogo de eventos y venues
- **LiveTrackingContext** — Telemetría en tiempo real, clima y aforo
- **GamificationContext** — Insignias, puntos y ranking de artistas

```mermaid
classDiagram
    namespace CatalogContext {
        class Event {
            +UUID id
            +String titulo
            +String descripcion
            +EventType tipo
            +EventStatus estado
            +DateTime fechaInicio
            +DateTime fechaFin
            +UUID venueId
            +String[] artistas
            +String imagenUrl
            +create()
            +update()
            +cancel()
            +publish()
        }

        class Venue {
            +UUID id
            +String nombre
            +GeoPoint ubicacion
            +Integer aforoMaximo
            +Integer aforoActual
            +String direccion
            +checkCapacity()
            +updateOccupancy()
        }

        class FlashPerformance {
            +UUID id
            +UUID artistaId
            +UUID venueId
            +DateTime inicio
            +Integer duracionMin
            +Boolean activo
            +start()
            +end()
        }

        class DaySchedule {
            +Date fecha
            +ScheduleSlot[] slots
            +getByDate()
        }
    }

    namespace LiveTrackingContext {
        class AforoEvent {
            +UUID venueId
            +Integer aforoCurrent
            +Integer aforoMax
            +Float porcentaje
            +DateTime timestamp
        }

        class WeatherAlert {
            +String tipo
            +String severidad
            +String mensaje
            +String[] venuesAfectados
            +DateTime timestamp
        }

        class LiveChannel {
            +String channelId
            +ChannelType type
            +subscribe()
            +publish()
            +unsubscribe()
        }
    }

    namespace GamificationContext {
        class Insignia {
            +UUID id
            +String codigo
            +String nombre
            +String descripcion
            +String imagenUrl
            +InsigniaType tipo
        }

        class UsuarioGamification {
            +UUID userId
            +Integer puntosTotales
            +Insignia[] insignias
            +Integer rankingPos
            +earnPoints()
            +unlockBadge()
        }

        class GamificationEvent {
            +String tipo
            +UUID userId
            +Integer puntosGanados
            +DateTime timestamp
        }
    }

    Event "1" --> "1" Venue : se realiza en
    Event "1" --> "*" DaySchedule : aparece en
    FlashPerformance "1" --> "1" Venue : ocurre en
    AforoEvent "*" --> "1" Venue : monitorea
    LiveChannel --> AforoEvent : publica
    LiveChannel --> WeatherAlert : publica
    GamificationEvent "*" --> "1" UsuarioGamification : actualiza
    UsuarioGamification "*" --> "*" Insignia : desbloquea
```

---

## Vista 2 — Procesos

La vista de procesos muestra cómo los componentes del sistema interactúan en tiempo de ejecución. Se ilustra el flujo más crítico: **registro de una Flash Performance y propagación de eventos**.

```mermaid
sequenceDiagram
    actor Artista
    participant GW as API Gateway<br/>(Traefik)
    participant CS as Catalog Service<br/>:3001
    participant Redis as Redis Pub/Sub<br/>Event Bus
    participant TS as Live Tracking Service<br/>:3002
    participant GS as Gamification Service<br/>:3003
    participant WS as WebSocket Hub<br/>(LiveTracking)
    participant Cliente as Cliente Web<br/>(React+Vite)

    Artista->>GW: POST /api/v1/events/flash<br/>{ venueId, duracionMin }
    GW->>CS: forward request + JWT validation
    CS->>CS: Validar JWT (rol: artista)
    CS->>CS: Verificar aforo disponible en Venue
    CS->>CS: Crear FlashPerformance en PostgreSQL

    CS->>Redis: PUBLISH "events.flash.started"<br/>{ flashId, venueId, artistaId, inicio }
    CS-->>GW: 201 Created { id, estado: "activo" }
    GW-->>Artista: 201 Created

    Redis-->>TS: SUB "events.flash.started"
    TS->>TS: Incrementar aforoActual en Venue
    TS->>Redis: PUBLISH "venues.aforo.updated"<br/>{ venueId, aforoActual, porcentaje }
    TS->>WS: Notificar canal "venue:{venueId}"

    Redis-->>GS: SUB "events.flash.started"
    GS->>GS: Calcular puntos (flash performance = +50 pts)
    GS->>GS: Verificar insignias desbloqueables
    GS->>Redis: PUBLISH "gamification.points.earned"<br/>{ userId, puntos, insigniaId? }

    WS-->>Cliente: WS push "aforo-update"<br/>{ venueId, aforoActual, porcentaje }
    WS-->>Cliente: WS push "gamification-event"<br/>{ puntos, insignia? }
    Cliente->>Cliente: Actualizar UI en tiempo real
```

---

## Vista 3 — Desarrollo

La vista de desarrollo describe la organización estática del código fuente: estructura del monorepo, capas de Clean Architecture por servicio, y dependencias entre módulos.

```mermaid
flowchart TD
    subgraph Monorepo["📦 Monorepo — pnpm workspaces"]
        subgraph Specs["specs/ — Contratos (SDD)"]
            OA1["specs/openapi/\ncatalog-service.yaml\n✅ Spec 1 — Mateo"]
            OA2["specs/openapi/\ngamification-service.yaml\n🔀 Spec 2 — branch: spec/gamification-api"]
            AA3["specs/asyncapi/\nlive-events-stream.yaml\n🔀 Spec 3 — branch: spec/live-stream"]
            GH4["specs/features/\n*.feature\n✅ Spec 4 — Mateo (Gherkin BDD)"]
        end

        subgraph Shared["packages/shared-contracts"]
            SC["Generated TypeScript types\nfrom OpenAPI + AsyncAPI\n(openapi-typescript, asyncapi-modelina)"]
        end

        subgraph Services["services/"]
            subgraph CatSvc["catalog-service (NestJS :3001)"]
                C1["domain/\n  entities/ events/ venues/\n  value-objects/"]
                C2["application/\n  use-cases/ commands/ queries/"]
                C3["infrastructure/\n  repositories/ redis-publisher/"]
                C4["interface/\n  http/ controllers/ dto/"]
            end

            subgraph LiveSvc2["live-tracking-service (NestJS :3002)"]
                L1["domain/\n  entities/ channels/"]
                L2["application/\n  handlers/ projections/"]
                L3["infrastructure/\n  redis-subscriber/ websocket-hub/"]
                L4["interface/\n  ws/ gateways/"]
            end

            subgraph GamSvc2["gamification-service (NestJS :3003)"]
                G1["domain/\n  entities/ insignias/"]
                G2["application/\n  event-handlers/ rules/"]
                G3["infrastructure/\n  repositories/ redis-subscriber/"]
                G4["interface/\n  http/ controllers/"]
            end
        end

        subgraph Frontend["apps/web (React + Vite :5173)"]
            F1["pages/ components/ hooks/"]
            F2["MapLibre GL — mapa de venues"]
            F3["WebSocket client — tiempo real"]
        end
    end

    OA1 --> SC
    OA2 --> SC
    AA3 --> SC
    SC --> CatSvc
    SC --> LiveSvc2
    SC --> GamSvc2
    SC --> Frontend
```

> **Convención de capas (Clean Architecture):**  
> `domain` → `application` → `infrastructure` → `interface`  
> Las dependencias apuntan siempre hacia el interior (domain no depende de nada externo).

---

## Vista 4 — Física (Despliegue)

La vista física describe el mapeo de los procesos software a nodos de hardware/infraestructura: contenedores Docker Compose, redes y volúmenes.

```mermaid
flowchart TD
    Internet(["🌐 Internet / Usuario"])

    subgraph VPS["VPS — Docker Compose (producción)"]
        subgraph PublicNet["Red: public-net"]
            Traefik["🔀 Traefik\n(Reverse Proxy + TLS)\n:80 / :443\nimage: traefik:v3.0"]
        end

        subgraph InternalNet["Red: internal-net (interna)"]
            CS2["📦 catalog-service\n:3001\nNestJS + TypeScript"]
            LS["📦 live-tracking-service\n:3002\nNestJS + WebSocket"]
            GS3["📦 gamification-service\n:3003\nNestJS + TypeScript"]
            Web["📦 web (React+Vite)\n:5173\nservida por Nginx"]
            Prism["📦 mock-catalog (Prism)\n:4010\nOpenAPI mock server"]
        end

        subgraph DataNet["Red: data-net (aislada)"]
            PG["🗄️ PostgreSQL 16 + PostGIS\n:5432\nVolumen: postgres_data"]
            RD["⚡ Redis 7\n:6379\nPub/Sub + Cache\nVolumen: redis_data"]
        end
    end

    Internet --> Traefik
    Traefik -->|"/api/v1/events*"| CS2
    Traefik -->|"/api/v1/gamification*"| GS3
    Traefik -->|"/ws/*"| LS
    Traefik -->|"/"| Web

    CS2 --> PG
    CS2 --> RD
    LS --> RD
    GS3 --> PG
    GS3 --> RD

    CS2 -->|"PUBLISH events.*"| RD
    RD -->|"SUBSCRIBE events.*"| LS
    RD -->|"SUBSCRIBE events.*"| GS3
```

**Volúmenes persistentes:**
| Volumen | Contenido | Respaldo |
|---------|-----------|----------|
| `postgres_data` | Eventos, venues, usuarios, insignias | pg_dump diario |
| `redis_data` | Cache y cola de eventos (AOF) | redis-cli SAVE |

**Variables de entorno críticas (`.env.example`):**
```
POSTGRES_DB=artesvivas
POSTGRES_USER=avuser
POSTGRES_PASSWORD=<secret>
REDIS_HOST=redis
JWT_SECRET=<secret>
```

---

## Resumen de Decisiones Arquitectónicas

| ADR | Decisión | Alternativa Descartada | Razón |
|-----|----------|------------------------|-------|
| [ADR-0001](adr/0001-event-driven-architecture.md) | Event-Driven Architecture | Modular Monolith | EDA permite desacoplamiento real entre servicios |
| [ADR-0002](adr/0002-specification-driven-development.md) | Spec-First (SDD) | Code-First | Contrato como única fuente de verdad antes de implementar |
| [ADR-0003](adr/0003-redis-as-event-bus.md) | Redis Pub/Sub como Event Bus | Kafka, RabbitMQ | Menor overhead operativo; suficiente para escala del festival |

---

*Generado como parte del entregable académico — Arquitectura de Software, 2026*
