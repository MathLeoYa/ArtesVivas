# ADR 0002 — Metodología: Specification-Driven Development (SDD)

**Estado:** Aceptado  
**Fecha:** 2026-11-19  
**Autores:** Equipo Pulso Loja (Mateo, Integrante 2, Integrante 3)

---

## Contexto

Trabajamos en un equipo de 3 personas en paralelo sobre 3 microservicios distintos. Sin un contrato claro, el riesgo de integración al final es muy alto: el frontend espera un campo `horaInicio` y el backend retorna `start_time`. Los tests fallan al integrar después de semanas de trabajo independiente.

## Decisión

Se adopta **Specification-Driven Development (SDD)** donde:

1. **El spec se escribe ANTES del código** — siempre.
2. **El spec aprobado es inmutable** — un cambio requiere un nuevo PR revisado por el equipo.
3. **El código debe conformarse al spec** — no al revés. Si el código no puede cumplir el spec, el spec se revisa, no el código.
4. **El CI bloquea PRs de implementación sin spec aprobado** — es un gate automático.

## Artefactos de Especificación

| Tipo | Herramienta | Archivo | Qué especifica |
|:---|:---|:---|:---|
| **OpenAPI 3.1** | Spectral (lint) | `specs/openapi/*.yaml` | Endpoints REST: rutas, métodos, parámetros, esquemas, respuestas |
| **AsyncAPI 3.0** | @asyncapi/cli | `specs/asyncapi/*.yaml` | Canales WebSocket: mensajes, payloads, operaciones |
| **Gherkin/BDD** | Cucumber | `specs/features/*.feature` | Reglas de negocio: comportamiento esperado en lenguaje natural + ejecutable |

## Ciclo de Vida SDD

```
Escribir Spec → Lint CI ✅ → PR Review (2 aprobaciones) → Merge a main
                                                                  ↓
                                                    Generar Tipos TypeScript
                                                                  ↓
                                                    Implementar Servicio
                                                                  ↓
                                                    Contract Tests → PR Merge
```

## Consecuencias

**Positivas:**
- **Integración sin sorpresas**: los 3 servicios hablan el mismo lenguaje desde el día 1.
- **Mock servers gratuitos**: Prism genera mocks de los endpoints OpenAPI automáticamente. El frontend puede desarrollar contra mocks mientras el backend no está listo.
- **Documentación siempre actualizada**: el spec es la documentación, no puede desincronizarse.
- **Detección temprana de conflictos**: si el Spec 3 (AsyncAPI) espera un campo que el Spec 1 (OpenAPI) no provee, se detecta en la revisión del PR, no en producción.

**Negativas:**
- **Overhead inicial**: escribir un spec bien formado toma más tiempo que escribir código directamente. Requiere disciplina del equipo.
- **Curva de aprendizaje**: OpenAPI y AsyncAPI tienen sintaxis detallada. Mitigado con ejemplos en este repositorio.
