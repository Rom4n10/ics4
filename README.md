# 🏥 AgendaYA — Sistema de Gestión Hospitalaria

Sistema de gestión de turnos hospitalarios con pruebas end-to-end automatizadas usando **Cypress** y pruebas unitarias con **Vitest**.

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Cypress — Pruebas E2E](#-cypress--pruebas-e2e)
  - [¿Qué es Cypress?](#qué-es-cypress)
  - [Ejecutar Cypress en modo interactivo](#ejecutar-cypress-en-modo-interactivo-recomendado)
  - [Ejecutar Cypress en modo headless](#ejecutar-cypress-en-modo-headless-ci)
  - [Ejecutar un archivo de test específico](#ejecutar-un-archivo-de-test-específico)
- [Pruebas Disponibles](#-pruebas-disponibles)
- [Estructura de Archivos Cypress](#-estructura-de-archivos-cypress)
- [Convenciones de Testing](#-convenciones-de-testing)
- [Pruebas Unitarias (Vitest)](#-pruebas-unitarias-vitest)
- [CI/CD](#-cicd)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Requisitos Previos

| Herramienta | Versión mínima |
|-------------|---------------|
| **Node.js**  | v18 o superior |
| **npm**      | v9 o superior  |

> [!NOTE]
> Verificá tu versión instalada con:
> ```bash
> node --version
> npm --version
> ```

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ics4
```

### 2. Instalar las dependencias de Cypress (raíz del proyecto)

```bash
npm install
```

Esto instalará **Cypress v16** como dependencia de desarrollo, según está configurado en el `package.json` raíz.

### 3. Instalar las dependencias de la aplicación

```bash
cd ics
npm install
```

Esto instalará **Vite**, **Vitest** y **jsdom** para el servidor de desarrollo y las pruebas unitarias.

### 4. Verificar la instalación de Cypress

```bash
# Volver a la raíz del proyecto
cd ..
npx cypress verify
```

> [!TIP]
> Si es la primera vez que instalás Cypress, la verificación descargará el binario del navegador. Esto puede tardar unos minutos dependiendo de tu conexión a internet.

---

## 🗂 Estructura del Proyecto

```
ics4/
├── .github/workflows/
│   └── ci.yml                  # Pipeline de CI/CD
├── cypress/
│   ├── e2e/                    # Tests end-to-end
│   │   ├── m03-event-types.cy.js   # Tests de tipos de evento
│   │   └── m04-booking.cy.js       # Tests del flujo de booking
│   ├── fixtures/               # Datos de prueba (mocks)
│   │   └── example.json
│   └── support/                # Archivos de soporte
│       ├── commands.js         # Comandos personalizados
│       └── e2e.js              # Configuración global de tests
├── ics/                        # Aplicación frontend
│   ├── index.html              # Página principal (gestión)
│   ├── booking.html            # Página de booking público
│   ├── js/                     # Lógica JavaScript
│   ├── css/                    # Estilos
│   ├── tests/                  # Pruebas unitarias (Vitest)
│   └── package.json
├── cypress.config.js           # Configuración de Cypress
└── package.json                # Dependencias de Cypress
```

---

## 🧪 Cypress — Pruebas E2E

### ¿Qué es Cypress?

[Cypress](https://www.cypress.io/) es un framework de pruebas end-to-end (E2E) que permite simular la interacción real de un usuario con la aplicación en un navegador. A diferencia de las pruebas unitarias, Cypress verifica flujos completos como crear un evento, hacer una reserva o validar formularios.

---

### Ejecutar Cypress en modo interactivo (Recomendado)

El modo interactivo abre una ventana del navegador donde podés ver cada paso del test ejecutarse en tiempo real. **Ideal para desarrollo y debugging.**

**Paso 1:** Levantar el servidor de desarrollo de la app:

```bash
cd ics
npm run dev
```

> [!IMPORTANT]
> El servidor de Vite debe estar corriendo **antes** de ejecutar Cypress. Por defecto levanta en `http://localhost:5173`.

**Paso 2:** En **otra terminal**, desde la raíz del proyecto:

```bash
npx cypress open
```

**Paso 3:** En la ventana de Cypress:
1. Seleccionar **"E2E Testing"**
2. Elegir un navegador (Chrome, Firefox, Edge, etc.)
3. Hacer click en **"Start E2E Testing"**
4. Seleccionar el archivo de test que se desea ejecutar

---

### Ejecutar Cypress en modo headless (CI)

Ejecuta todos los tests sin interfaz gráfica. **Ideal para CI/CD y ejecución automatizada.**

```bash
# Asegurarse de que el servidor de Vite esté corriendo en otra terminal
npx cypress run
```

Opciones útiles:

```bash
# Ejecutar con un navegador específico
npx cypress run --browser chrome

# Ejecutar con un navegador específico en modo headed (ver el navegador)
npx cypress run --browser chrome --headed

# Generar video de los tests
npx cypress run --browser chrome --video
```

---

### Ejecutar un archivo de test específico

```bash
# Solo los tests del módulo de tipos de evento
npx cypress run --spec "cypress/e2e/m03-event-types.cy.js"

# Solo los tests del módulo de booking
npx cypress run --spec "cypress/e2e/m04-booking.cy.js"
```

---

## 📝 Pruebas Disponibles

### M03 — Tipos de Evento (`m03-event-types.cy.js`)

| Test | Tipo | Descripción |
|------|------|-------------|
| Crear tipo de evento | ✅ Happy Path | Crea un nuevo tipo de evento con nombre, descripción, duración y modalidad, y verifica que aparezca en la tabla |
| Campos vacíos | ❌ Sad Path | Intenta crear un tipo de evento sin completar los campos obligatorios y verifica los mensajes de error |
| Editar tipo de evento | ✅ Happy Path | Edita un tipo de evento existente, modificando nombre y duración, y verifica la actualización |

### M04 — Booking Público (`m04-booking.cy.js`)

| Test | Tipo | Descripción |
|------|------|-------------|
| Campos obligatorios vacíos | ❌ Sad Path | Intenta confirmar una reserva sin completar nombre y email en el paso 3, y verifica los mensajes de validación |
| Reserva exitosa | ✅ Happy Path | Completa el flujo completo de booking (selección de evento → fecha → horario → datos → confirmación) y verifica la pantalla de éxito |

---

## 📁 Estructura de Archivos Cypress

| Directorio / Archivo | Propósito |
|-----------------------|-----------|
| `cypress/e2e/` | Contiene los archivos de test E2E (`.cy.js`) |
| `cypress/fixtures/` | Datos estáticos de prueba (JSON) para usar con `cy.fixture()` |
| `cypress/support/commands.js` | Comandos personalizados reutilizables (ej. `cy.login()`) |
| `cypress/support/e2e.js` | Configuración global que se carga antes de cada test |
| `cypress.config.js` | Configuración principal de Cypress |

---

## 📐 Convenciones de Testing

Este proyecto sigue las siguientes convenciones para los tests E2E:

### Patrón AAA (Arrange-Act-Assert)

Cada test sigue el patrón estándar:

```javascript
it('(HP) Descripción del caso de prueba', () => {
  // Arrange: preparar el estado inicial
  cy.visit('ics/index.html');
  cy.get('[data-cy="btn-new-event"]').click();

  // Act: ejecutar la acción principal
  cy.get('[data-cy="form-submit-btn"]').click();

  // Assert: verificar el resultado esperado
  cy.get('[data-cy="event-row"]').should('be.visible');
});
```

### Selectores `data-cy`

Se utilizan atributos `data-cy` para localizar elementos del DOM. Esto hace los tests más resilientes a cambios de estilos o estructura HTML:

```html
<!-- En el HTML -->
<button data-cy="btn-new-event">Nuevo Evento</button>
```

```javascript
// En el test
cy.get('[data-cy="btn-new-event"]').click();
```

### Nomenclatura de Tests

- **`(HP)`** = Happy Path → Flujo exitoso esperado
- **`(SAD)`** = Sad Path → Caso de error o validación

---

## 🧪 Pruebas Unitarias (Vitest)

Además de las pruebas E2E con Cypress, el proyecto incluye pruebas unitarias con **Vitest** ubicadas en `ics/tests/`.

```bash
# Desde el directorio ics/
cd ics

# Ejecutar pruebas unitarias
npm run test

# Ejecutar en modo watch (re-ejecuta al guardar cambios)
npm run test:watch
```

---

## 🚀 CI/CD

El proyecto cuenta con un pipeline de GitHub Actions (`.github/workflows/ci.yml`) que ejecuta automáticamente las pruebas unitarias en cada push o pull request a la rama `main`.

```
Push/PR a main → Checkout → Node.js 20 → npm install → npm run test
```

---

## 🔍 Troubleshooting

### Cypress no se abre o falla al iniciar

```bash
# Limpiar la caché de Cypress
npx cypress cache clear

# Reinstalar el binario
npx cypress install

# Verificar la instalación
npx cypress verify
```

### El test falla porque no encuentra elementos

1. Verificá que el servidor de desarrollo esté corriendo (`npm run dev` en `ics/`)
2. Verificá que la URL base sea correcta (Cypress busca `ics/index.html` o `ics/booking.html`)
3. Confirmá que los atributos `data-cy` existan en el HTML

### Error: "Cypress requires a display to run"

Si estás en un entorno sin interfaz gráfica (servidor Linux, WSL), usá el modo headless:

```bash
npx cypress run --browser chrome --headless
```

### Los tests de booking fallan intermitentemente

Algunos tests de booking dependen de la disponibilidad de horarios. Si no hay horarios libres, el test puede fallar. Asegurate de que existan tipos de evento creados con horarios disponibles antes de ejecutar los tests de booking.

---

> [!TIP]
> Para más información sobre Cypress, consultá la [documentación oficial](https://docs.cypress.io/).
