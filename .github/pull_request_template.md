## 📋 Checklist de Pull Request — Pulso Loja (SDD Workflow)

### Tipo de PR
- [ ] `spec/` — Nueva especificación o cambio en contrato existente
- [ ] `feat/` — Nueva funcionalidad de implementación
- [ ] `fix/` — Corrección de error
- [ ] `docs/` — Documentación
- [ ] `ci/` — Cambios en pipelines de CI/CD
- [ ] `infra/` — Infraestructura (Docker, scripts)

---

### Si es un PR de Spec (`spec/`)

> [!IMPORTANT]
> Un spec mergeado a `main` es un contrato inmutable. Revisarlo con cuidado.

- [ ] El archivo OpenAPI/AsyncAPI/Gherkin sigue la convención de nombres y ubicación correcta
- [ ] Todos los modelos tienen sus campos `required` correctamente definidos
- [ ] Los ejemplos en el spec son válidos y representativos
- [ ] Los errores HTTP están correctamente especificados (400, 401, 403, 404, 422, etc.)
- [ ] Los eventos de dominio que emite el servicio están documentados en la descripción
- [ ] Si es OpenAPI: **el CI de Spectral pasa** ✅
- [ ] Si es AsyncAPI: **el CI de @asyncapi/cli pasa** ✅
- [ ] Si es Gherkin: **la sintaxis es válida y los escenarios cubren los happy paths y edge cases** ✅
- [ ] Los otros 2 integrantes del equipo revisaron y aprobaron el spec

---

### Si es un PR de Implementación (`feat/`)

- [ ] **El spec correspondiente ya fue mergeado a `main` ANTES de este PR**
- [ ] El código usa los tipos generados desde el spec (en `packages/shared-contracts/src/`)
- [ ] Los endpoints implementados coinciden exactamente con los definidos en el spec (método, ruta, parámetros, respuestas)
- [ ] Los eventos de dominio emitidos son los especificados en el spec
- [ ] Las pruebas unitarias pasan
- [ ] Las pruebas de contrato pasan
- [ ] No hay lógica de negocio que contradiga los escenarios Gherkin del Spec 4

---

### Descripción del Cambio

> Describe brevemente qué cambia y por qué.

**Qué cambia:**

**Por qué:**

**Spec relacionado:**

---

### Screenshots o evidencia (si aplica)

---

### Notas para los revisores
