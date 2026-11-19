# ADR 0003 — Redis como Event Bus (en lugar de Kafka)

**Estado:** Aceptado  
**Fecha:** 2026-11-19  
**Autores:** Equipo Pulso Loja (Mateo, Integrante 2, Integrante 3)

---

## Contexto

La arquitectura EDA requiere un mecanismo de mensajería asíncrona entre los 3 microservicios. Las opciones evaluadas son Redis Pub/Sub vs Apache Kafka.

## Decisión

**Redis 7 Pub/Sub** como Event Bus, usando el mismo nodo Redis que ya se usa para caché y geolocalización.

## Comparación

| Criterio | Redis Pub/Sub | Apache Kafka |
|:---|:---|:---|
| **Throughput** | ~100K msg/s | ~1M msg/s |
| **Escala del festival** | Suficiente (máx ~50K usuarios en Loja) | Excesivo |
| **Persistencia de mensajes** | No (fire-and-forget) | Sí (log persistente) |
| **Complejidad operativa** | Mínima (ya usamos Redis) | Alta (Zookeeper, brokers, particiones) |
| **Equipo requerido** | 1 DevOps part-time | 1 DevOps dedicado |
| **Curva de aprendizaje** | Baja | Alta |
| **Costo de infraestructura** | Incluido en Redis existente | \$50-200/mes adicional |
| **Idoneidad para el proyecto** | ✅ Perfecta | ❌ Over-engineering |

## Consecuencia Aceptada

Redis Pub/Sub es **fire-and-forget**: si un consumidor no está conectado cuando se publica el mensaje, **lo pierde**. Para el caso de uso del festival esto es aceptable:
- Si telemetry-service se cae 1 segundo, perder una actualización de aforo no es crítico.
- Los datos siempre se pueden refrescar con una consulta directa (eventual consistency).

Si en el futuro se requiere garantía de entrega (at-least-once), se puede migrar a **Redis Streams** (misma infraestructura, semántica de log persistente) sin cambiar el Event Bus.
