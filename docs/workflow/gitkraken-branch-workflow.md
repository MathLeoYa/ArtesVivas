# 🐙 Guía de Trabajo Colaborativo con GitKraken — Pulso Loja (FIAVL)

Esta guía define cómo los **3 integrantes** del equipo colaboran usando **GitKraken** para el flujo de ramas (*Branch-Based Workflow*), garantizando una evidencia visual impecable para el video de sustentación de 5 minutos.

---

## 1. Configuración Inicial en GitKraken

1. Abrir **GitKraken Client**.
2. Ir a **File → Open Repo** y seleccionar la carpeta:  
   `artes-vivas-loja/`
3. En la barra superior, verificar que la rama activa sea `main` (o `master`).
4. Si ya crearon el repositorio en GitHub:
   - Configurar el Remote: **Remotes → (+) Add Remote → GitHub**.
   - Conectar sus cuentas de GitHub para que los avatares de los 3 aparezcan en el grafo.

---

## 2. Mapa Visual de Ramas para el Equipo

En GitKraken, el árbol de commits debe verse claramente dividido por responsabilidades:

```mermaid
gitGraph
    commit id: "setup: repo base" tag: "v0.1.0"
    
    %% Mateo trabaja en Spec 1 y Spec 4
    branch feature/spec-1
    checkout feature/spec-1
    commit id: "feat(spec1): openapi catalog-service"
    checkout main
    merge feature/spec-1 id: "PR #1: Spec 1 Aprobado"
    
    %% Integrante 2 trabaja en Spec 2
    branch feature/spec-2
    checkout feature/spec-2
    commit id: "feat(spec2): openapi gamification"
    
    %% Integrante 3 trabaja en Spec 3
    branch feature/spec-3
    checkout feature/spec-3
    commit id: "feat(spec3): asyncapi websockets"
    
    %% Integrante 2 y 3 se mergean tras aprobacion
    checkout main
    merge feature/spec-2 id: "PR #2: Spec 2 Aprobado"
    merge feature/spec-3 id: "PR #3: Spec 3 Aprobado"
    
    %% Implementación posterior
    branch feat/catalog-service
    checkout feat/catalog-service
    commit id: "feat(catalog): endpoints nestjs"
```

---

## 3. Instrucciones Paso a Paso por Integrante

### 👤 Integrante 1: Mateo (Líder)
* **Tus ramas:**
  * `feature/spec-1` → Creación y ajustes del Spec 1 (OpenAPI del Catálogo). *(Completado y mergeado en `main`)*.
  * `feature/spec-4` → Escenarios de negocio Gherkin BDD (Spec 4).
  * `feat/catalog-service` → Implementación del microservicio de catálogo.
* **Acción en GitKraken:**
  1. Click derecho sobre `main` → **Create branch here** → `feature/spec-4`.
  2. Commitear los archivos `.feature` de pruebas.
  3. Push y crear Pull Request hacia `main`.

---

### 👤 Integrante 2
* **Su rama:** `feature/spec-2`
* **Su responsabilidad:** Elaborar el Spec 2 (OpenAPI de gamificación, pasaporte y votos).
* **Acción en GitKraken:**
  1. Click derecho sobre `main` → **Create branch here** → `feature/spec-2`.
  2. Agregar `specs/openapi/gamification-service.yaml`.
  3. En GitKraken, hacer stage de los cambios en el panel derecho.
  4. Mensaje de commit: `feat(spec2): definir contrato openapi para gamification-service`.
  5. Click en **Push** y abrir Pull Request en GitHub hacia `main`.
  6. Pedir la revisión y aprobación de Mateo y del Integrante 3.

---

### 👤 Integrante 3
* **Su rama:** `feature/spec-3`
* **Su responsabilidad:** Elaborar el Spec 3 (AsyncAPI de WebSockets y telemetría en vivo).
* **Acción en GitKraken:**
  1. Click derecho sobre `main` → **Create branch here** → `feature/spec-3`.
  2. Agregar `specs/asyncapi/live-events-stream.yaml`.
  3. Mensaje de commit: `feat(spec3): definir canales asyncapi para live stream y alertas`.
  4. Push y abrir Pull Request en GitHub hacia `main`.
  5. Pedir revisión y aprobación del equipo.

---

## 4. Convención de Commits (Conventional Commits)

Para que el historial en GitKraken luzca profesional ante el evaluador:

| Prefijo | Cuándo usarlo | Ejemplo |
| :--- | :--- | :--- |
| `feat(spec):` | Nueva especificación o endpoint en spec | `feat(spec1): agregar endpoint DELETE /events/{id}` |
| `fix(spec):` | Corrección de error o validación en contrato | `fix(spec2): ajustar rango de calificacion 1-5` |
| `test(bdd):` | Escenarios Gherkin nuevos o modificados | `test(bdd): agregar regla de aforo maximo al 100%` |
| `feat(svc):` | Código de implementación de un servicio | `feat(catalog): controller y service de eventos` |
| `ci:` | Cambios en workflows de GitHub Actions | `ci: agregar linter spectral para openapi` |
| `docs:` | Documentación y modelos arquitectónicos | `docs: modelo 4+1 vistas en mermaid` |

---

## 5. Qué Mostrar en el Video de Sustentación (Minuto de GitKraken)

Durante la exposición de la dinámica de trabajo (aprox. **minuto 2:30 a 3:30**):
1. **Abrir la pantalla de GitKraken a pantalla completa.**
2. **Señalar el grafo de ramas:**
   * *"Aquí se evidencia nuestra dinámica de trabajo colaborativa basada en ramas."*
   * *"Cada integrante abrió su propia rama para su especificación (`spec/*`), respetando la metodología SDD."*
   * *"Ningún código ni contrato entró a `main` sin pasar por Pull Request y revisión por pares."*
3. Mostrar un commit específico donde se vean los autores y cómo las ramas confluyen limpiamente.
