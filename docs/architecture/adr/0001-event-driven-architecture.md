# ADR 0001 — Estilo Arquitectónico: Event-Driven Architecture (EDA)

**Estado:** Aceptado  
**Fecha:** 2026-11-19  
**Autores:** Equipo Pulso Loja (Mateo, Integrante 2, Integrante 3)

---

## Contexto

El Festival Internacional de Artes Vivas de Loja (FIAVL) es un evento de 10 días con:
- Localización en espacios públicos patrimoniales (plazas, calles, teatros)
- Alta volatilidad: actos espontáneos, cambios de clima andino, aforos impredecibles
- Picos de uso masivos e impredecibles (fin de acto: miles de usuarios consultando a la vez)
- Necesidad de comunicación en tiempo real entre servicios (clima → reubicación → notificación → mapa)
- 3 dominios funcionales independientes: Catálogo, Telemetría/Aforo, Gamificación

## Decisión

Se adopta **Event-Driven Architecture (EDA)** como estilo arquitectónico principal, implementado mediante 3 microservicios NestJS que se comunican exclusivamente a través de **Redis Pub/Sub** como Event Bus.

Los servicios **no se llaman directamente entre sí**. En su lugar, publican **eventos de dominio** al bus y otros servicios reaccionan a esos eventos de forma asíncrona.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|:---|:---|
| **Monolito Modular** | Excluido por requisito del proyecto. Además, no resuelve bien los picos de carga aislados por dominio. |
| **Microservicios con REST síncrono** | Acoplamiento temporal fuerte. Si el catalog-service está caído, el telemetry-service no puede notificar. No tolerante a fallos. |
| **Microservicios con Kafka** | Kafka es infraestructura empresarial (Zookeeper, brokers, particiones). Para 3 desarrolladores en 2 semanas es over-engineering injustificable. Redis Pub/Sub es suficiente para la escala del festival. |
| **Serverless (AWS Lambda / Cloud Functions)** | Latencia de cold-start incompatible con WebSockets en tiempo real. Complejidad de despliegue excesiva para el equipo. |

## Consecuencias

**Positivas:**
- Los servicios son **independientes en fallo**: si gamification-service cae, catalog-service y telemetry-service siguen operando.
- **Escalabilidad selectiva**: si el canal WebSocket tiene picos, solo se escala telemetry-service.
- Los eventos de dominio son **auditables**: se puede reconstruir el estado del festival desde el log de eventos.
- **Reactivo por naturaleza**: el mapa se actualiza sin polling.

**Negativas / Trade-offs:**
- **Eventual consistency**: los clientes pueden ver datos con un retraso de milisegundos (aceptable para el caso de uso).
- **Debugging más complejo**: los flujos de datos cruzan servicios via eventos, no hay un stack trace lineal.
- **Duplicación de modelos de datos**: cada servicio tiene su propia representación de `Event`. Se mitiga con `packages/shared-contracts/`.

## Eventos de Dominio Definidos

```
FlashPerformanceStarted → telemetry-service notifica a espectadores cercanos
EventCreated             → telemetry-service actualiza el mapa
EventUpdated             → telemetry-service broadcast a todos los clientes
EventCancelled           → telemetry-service actualiza mapa y notifica
EventRelocated           → telemetry-service actualiza mapa y notifica
VoteCast                 → telemetry-service actualiza aplausómetro en tiempo real
StampEarned              → telemetry-service puede mostrar en el mapa (futuro)
BadgeUnlocked            → notificación personalizada al usuario (futuro)
```
