# 🎭 Pulso Loja — Festival Internacional de Artes Vivas de Loja (FIAVL)

> Plataforma digital en tiempo real para el Festival Internacional de Artes Vivas de Loja, Ecuador.

[![Specs CI](https://github.com/YOUR_ORG/artes-vivas-loja/actions/workflows/specs-validation.yml/badge.svg)](https://github.com/YOUR_ORG/artes-vivas-loja/actions)
[![Services CI](https://github.com/YOUR_ORG/artes-vivas-loja/actions/workflows/services-ci.yml/badge.svg)](https://github.com/YOUR_ORG/artes-vivas-loja/actions)

## 🌟 Concepto

**Pulso Loja** convierte la ciudad en un escenario digital vivo:
- 🗺️ **Mapa Cultural Interactivo** — eventos, flash-performances y hitos geolocalizados en tiempo real
- 📡 **Semáforo de Aforo** — monitoreo de capacidad en plazas y salas patrimoniales (Plaza San Sebastián, Teatro Benjamín Carrión, etc.)
- 🏆 **Pasaporte Cultural Gamificado** — sellos digitales por visitar escenarios y participar en actos
- 🎉 **Aplausómetro Digital** — votación en vivo para eventos en curso
- ⛈️ **Alertas de Clima & Reubicación** — notificaciones push ante lluvia andina con escenarios alternativos

## 🏛️ Arquitectura

**Estilo:** Event-Driven Architecture (EDA) — sin monolito  
**Metodología:** Specification-Driven Development (SDD)  
**Modelo:** 4+1 Vistas de Kruchten

Ver [`docs/architecture/4+1-views.md`](./docs/architecture/4+1-views.md)

## 👥 Equipo

| Integrante | Responsabilidad | Specs |
|:---|:---|:---|
| Mateo | Catalog Service + Frontend Map + BDD Tests | Spec 1 (OpenAPI Catalog) + Spec 4 (Gherkin BDD) |
| Integrante 2 | Gamification Service + Frontend Gamification | Spec 2 (OpenAPI Gamification) |
| Integrante 3 | Telemetry Service + Infrastructure | Spec 3 (AsyncAPI Live Stream) |

## 🚀 Inicio Rápido

### Pre-requisitos
- Docker Desktop
- Node.js 20+
- pnpm 9+

### Levantar el entorno completo

```bash
# Clonar el repositorio
git clone https://github.com/YOUR_ORG/artes-vivas-loja.git
cd artes-vivas-loja

# Levantar toda la infraestructura (Postgres, Redis, Traefik)
docker-compose up -d postgres redis traefik

# Instalar dependencias de todos los servicios
pnpm install

# Validar todos los specs (OpenAPI + AsyncAPI)
pnpm run specs:validate

# Levantar mock servers para desarrollo
pnpm run specs:mock

# Correr todos los servicios en modo desarrollo
pnpm run dev
```

## 📋 Especificaciones (SDD — Single Source of Truth)

| Spec | Tipo | Archivo / Rama | Owner | Estado |
|:---|:---|:---|:---|:---|
| **Spec 1: Catalog API** | OpenAPI 3.1 | [`specs/openapi/catalog-service.yaml`](./specs/openapi/catalog-service.yaml) | Mateo | ✅ En `main` |
| **Spec 2: Gamification API** | OpenAPI 3.1 | `specs/openapi/gamification-service.yaml` | Integrante 2 | ⏳ Pendiente (Rama `spec/gamification-api`) |
| **Spec 3: Live Stream** | AsyncAPI 3.0 | `specs/asyncapi/live-events-stream.yaml` | Integrante 3 | ⏳ Pendiente (Rama `spec/live-stream`) |
| **Spec 4: BDD Rules** | Gherkin | [`specs/features/`](./specs/features/) | Mateo | ✅ En `main` |

## 🔄 Flujo de Trabajo (Branch-Based SDD)

```
spec/<nombre>     → Escribir y aprobar el contrato
feat/<servicio>   → Implementar el servicio
fix/<issue>       → Correcciones
```

**Regla de oro:** Ningún código de implementación puede mergearse a `main` sin que el spec correspondiente esté aprobado.

## 🛠️ Tech Stack

| Capa | Tecnología |
|:---|:---|
| Frontend | React 18 + Vite + TypeScript + MapLibre GL |
| Backend | NestJS 10 + TypeScript |
| Base de Datos | PostgreSQL 16 + PostGIS |
| Caché & Events | Redis 7 (Pub/Sub + Geo + Cache) |
| Reverse Proxy | Traefik v3 |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Spec Tooling | Spectral, @asyncapi/cli, Prism |

## 📁 Estructura del Proyecto

```
artes-vivas-loja/
├── .github/
│   ├── workflows/
│   │   ├── specs-validation.yml     # CI: lint OpenAPI + AsyncAPI + BDD check
│   │   └── services-ci.yml          # CI: build + unit tests + contract tests
│   ├── ISSUE_TEMPLATE/
│   │   └── spec-proposal.md         # Template para proponer nuevo spec
│   └── pull_request_template.md     # Checklist de PR
├── docs/
│   └── architecture/
│       ├── 4+1-views.md             # Modelo arquitectónico completo
│       └── adr/
│           ├── 0001-event-driven-architecture.md
│           ├── 0002-specification-driven-development.md
│           └── 0003-redis-as-event-bus.md
├── specs/                           # ← SINGLE SOURCE OF TRUTH
│   ├── openapi/
│   │   ├── catalog-service.yaml
│   │   └── gamification-service.yaml
│   ├── asyncapi/
│   │   └── live-events-stream.yaml
│   └── features/
│       ├── control_aforo.feature
│       ├── flash_performances.feature
│       ├── alertas_clima.feature
│       └── votacion_en_vivo.feature
├── services/
│   ├── catalog-service/             # NestJS — Dominio: Eventos, Escenarios
│   ├── telemetry-service/           # NestJS — Dominio: Aforo, WebSocket, Alertas
│   └── gamification-service/        # NestJS — Dominio: Pasaporte, Votos, Badges
├── packages/
│   └── shared-contracts/            # Tipos TS generados desde specs OpenAPI
├── frontend/                        # React + Vite — PWA del festival
├── docker-compose.yml
├── docker-compose.prod.yml
├── .spectral.yaml                   # Config del linter de OpenAPI
└── package.json                     # Workspace raíz (pnpm workspaces)
```
