# Guión de Sustentación en Video (5 Minutos Máx.)
## Proyecto: Pulso Loja — Festival Internacional de Artes Vivas de Loja (FIAVL)

> **Regla de oro del video:** Cronometrado para 5:00 minutos exactos. Todos deben hablar y mostrar evidencia en pantalla.
> **Herramientas a mostrar:** Visual Studio Code, GitKraken (clave para evidencia de ramas), GitHub (PRs y Actions CI).

---

### Distribución de Tiempos
* **0:00 - 1:40 (1m 40s)**: Integrante 1 — Mateo (Líder del Proyecto)
* **1:40 - 3:10 (1m 30s)**: Integrante 2 — Desarrollador (Gamification / Spec 2)
* **3:10 - 4:40 (1m 30s)**: Integrante 3 — Desarrollador (Live Streaming / Spec 3)
* **4:40 - 5:00 (20s)**: Conclusión y Cierre (Mateo o los 3)

---

## 🎬 Minuto a Minuto del Guión

### PARTE 1: Introducción, Arquitectura y Spec 1 (0:00 - 1:40)
**Voz/Expositor:** Mateo (Líder)  
**Pantalla:** Mostrar primero el README del repo en GitHub, luego cambiar a `docker-compose.yml` y finalmente abrir GitKraken.

* **(0:00 - 0:25) Presentación y Contexto:**
  > *"Saludos. Presentamos el proyecto **Pulso Loja**, la plataforma digital para el Festival Internacional de Artes Vivas de Loja (FIAVL). Aplicamos la metodología **Specification-Driven Development (SDD)** con una Arquitectura Orientada a Eventos (**EDA**), huyendo del monolito modular tradicional para garantizar escalabilidad y desacoplamiento en tiempo real."*

* **(0:25 - 0:55) Inicialización del Stack Base (Responsabilidad de Líder):**
  *(Mostrar `docker-compose.yml` y estructura en VS Code)*
  > *"Como líder de equipo, inicialicé el stack tecnológico base: Traefik como API Gateway, PostgreSQL con PostGIS para datos geoespaciales, Redis como Message Broker para Pub/Sub y caché, servicios en NestJS y el pipeline de CI con Spectral y AsyncAPI en GitHub Actions."*

* **(0:55 - 1:40) Spec 1 y Flujo GitKraken:**
  *(Mostrar `specs/openapi/catalog-service.yaml` y luego la gráfica en GitKraken)*
  > *"Diseñé el **Spec #1: Catalog Service** en OpenAPI 3.1 con 10 endpoints, modelando la gestión de eventos, escenarios con aforo en tiempo real y flash-performances callejeras. Siguiendo la rúbrica colaborativa, cada miembro trabajó en su rama `feature/spec-X`. Doy paso a mi compañero para explicar el Spec 2."*

---

### PARTE 2: Gamification Service — Spec 2 (1:40 - 3:10)
**Voz/Expositor:** Integrante 2  
**Pantalla:** Mostrar rama `feature/spec-2` en GitKraken, luego abrir `specs/openapi/gamification-service.yaml` y su Pull Request en GitHub.

* **(1:40 - 2:10) Responsabilidad y Dominio de Negocio:**
  > *"Gracias Mateo. Yo asumí el desarrollo del **Spec #2**, enfocado en la interacción del público a través del Pasaporte Cultural Digital y el Aplausómetro. Siguiendo la metodología SDD, definí el contrato OpenAPI en mi rama `feature/spec-2` antes de escribir una sola línea de lógica."*

* **(2:10 - 2:45) Endpoints Clave y Dependencia con Spec 1:**
  *(Mostrar endpoints `/api/v1/votes` y `/api/v1/passport/stamp` en el YAML)*
  > *"Este servicio depende del Spec 1, ya que para emitir votos se valida el ID del evento en curso y la proximidad geográfica de 200m mediante PostGIS. Además, permite sellar visitas a escenarios (con radio de 100m) y otorga insignias culturales. Al emitirse un voto, mi servicio publica el evento `VoteCast` a Redis Pub/Sub."*

* **(2:45 - 3:10) Evidencia de Integración y CI:**
  *(Mostrar el Pull Request hacia `main` con el check verde de Spectral)*
  > *"Abrí el Pull Request hacia `main`, el cual superó las pruebas automatizadas de Spectral en GitHub Actions y fue revisado por el equipo."*

---

### PARTE 3: Live Telemetry & Streaming — Spec 3 (3:10 - 4:40)
**Voz/Expositor:** Integrante 3  
**Pantalla:** Mostrar rama `feature/spec-3` en GitKraken, luego `specs/asyncapi/live-events-stream.yaml` y el PR correspondiente.

* **(3:10 - 3:40) AsyncAPI y Protocolo WebSocket:**
  > *"Continuando con el flujo, yo lideré el **Spec #3: Live Telemetry Service**. Al ser un sistema en tiempo real para miles de asistentes, REST no era suficiente. Diseñé la especificación usando el estándar **AsyncAPI 3.0** sobre protocolo WebSocket bidireccional."*

* **(3:40 - 4:15) Consumo de Eventos y Canales:**
  *(Mostrar los channels: `festival/events/updates`, `liveVoteCount`, `weatherAlerts`)*
  > *"Este servicio es puramente reactivo: consume los eventos emitidos por el Catalog Service (como `FlashPerformanceStarted` o reubicaciones por lluvia) y por Gamification (`VoteCast`), y los retransmite al instante a la app web y móvil sin sobrecargar la base de datos."*

* **(4:15 - 4:40) Colaboración en GitKraken:**
  *(Mostrar el merge de `feature/spec-3` en GitKraken)*
  > *"El flujo de trabajo en GitKraken muestra claramente cómo mi rama `feature/spec-3` se integró limpiamente a `main` tras la aprobación de los contratos por mis dos compañeros."*

---

### PARTE 4: Conclusión y Vista 4+1 (4:40 - 5:00)
**Voz/Expositor:** Mateo (o cierre grupal)  
**Pantalla:** Mostrar el diagrama de Arquitectura en `docs/architecture/4plus1-views.md`.

* **(4:40 - 5:00) Cierre:**
  > *"En conclusión, la metodología Specification-Driven Development nos permitió trabajar de manera paralela e independiente, garantizando contratos inmutables antes de la codificación y evidenciando una colaboración real mediante GitKraken y GitHub. ¡Muchas gracias!"*
