# Guía Rápida de Implementación — Specs 2 y 3 (Para Compañeros)

Esta guía condensa todo lo que el **Integrante 2** y el **Integrante 3** deben hacer en sus respectivas computadoras paso a paso para completar la actividad sin complicaciones.

---

## 👤 GUÍA PARA EL INTEGRANTE 2 (Spec 2 — Gamification API)

### Objetivo:
Crear la rama `feature/spec-2`, colocar la especificación OpenAPI de Gamificación, validar con el linter y abrir el Pull Request a `main`.

### Pasos en la Terminal:
1. **Clonar el proyecto** (si no lo tiene aún):
   ```bash
   git clone https://github.com/MathLeoYa/ArtesVivas.git
   cd ArtesVivas
   ```
2. **Crear su rama dedicada según rúbrica**:
   ```bash
   git checkout -b feature/spec-2
   ```
3. **Copiar el archivo de spec**:
   * Crear la carpeta: `mkdir -p specs/openapi`
   * Copiar el contenido desde el template ya preparado:
     * El template está en: `docs/workflow/templates/gamification-service-template.yaml`
     * Copiarlo a: `specs/openapi/gamification-service.yaml`
     *(En Windows PowerShell puede hacer: `Copy-Item "docs\workflow\templates\gamification-service-template.yaml" "specs\openapi\gamification-service.yaml"`)*
4. **Validar con linter**:
   ```bash
   pnpm install
   pnpm run lint:specs
   ```
5. **Hacer commit y push**:
   ```bash
   git add specs/openapi/gamification-service.yaml
   git commit -m "feat(spec2): implementar especificacion openapi para gamification-service"
   git push -u origin feature/spec-2
   ```
6. **Abrir Pull Request en GitHub**:
   * Ir al repositorio en GitHub.
   * Clic en **Compare & pull request** de `feature/spec-2` hacia `main`.
   * Título: `feat(spec2): Gamification Service OpenAPI`
   * Asignar a Mateo como revisor.

---

## 👤 GUÍA PARA EL INTEGRANTE 3 (Spec 3 — Live Stream AsyncAPI)

### Objetivo:
Crear la rama `feature/spec-3`, colocar la especificación AsyncAPI de WebSockets, validar con el linter y abrir el Pull Request a `main`.

### Pasos en la Terminal:
1. **Clonar el proyecto**:
   ```bash
   git clone https://github.com/MathLeoYa/ArtesVivas.git
   cd ArtesVivas
   ```
2. **Crear su rama dedicada**:
   ```bash
   git checkout -b feature/spec-3
   ```
3. **Copiar el archivo de spec**:
   * Crear la carpeta: `mkdir -p specs/asyncapi`
   * Copiar el contenido desde el template ya preparado:
     * El template está en: `docs/workflow/templates/live-events-stream-template.yaml`
     * Copiarlo a: `specs/asyncapi/live-events-stream.yaml`
     *(En Windows PowerShell: `Copy-Item "docs\workflow\templates\live-events-stream-template.yaml" "specs\asyncapi\live-events-stream.yaml"`)*
4. **Validar con linter**:
   ```bash
   pnpm install
   pnpm run lint:specs
   ```
5. **Hacer commit y push**:
   ```bash
   git add specs/asyncapi/live-events-stream.yaml
   git commit -m "feat(spec3): implementar especificacion asyncapi para live stream y telemetria"
   git push -u origin feature/spec-3
   ```
6. **Abrir Pull Request en GitHub**:
   * Ir al repositorio en GitHub.
   * Clic en **Compare & pull request** de `feature/spec-3` hacia `main`.
   * Título: `feat(spec3): Live Tracking Service AsyncAPI`
   * Asignar a Mateo como revisor.

---

## 💡 Clave para el Grafo en GitKraken (Evidencia de Colaboración)
Una vez que ambos abran sus PRs y pasen los checks automáticos de GitHub Actions:
1. Mateo (o el equipo) aprueba los PRs en GitHub y hace **Merge Pull Request**.
2. Al abrir **GitKraken**, se verá el grafo perfecto: las ramas `feature/spec-2` y `feature/spec-3` naciendo de `main` y volviendo a integrarse con sus respectivos commits y autores. ¡Esa es la captura que lucirá en el video!
