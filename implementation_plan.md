# Plan de Implementación: Vista Kanban para Tipos de Eventos

## Objetivo
Añadir una vista Kanban en el panel de "Tipos de Evento" que permita visualizar los eventos agrupados por su estado ("Activos" e "Inactivos").

## Cambios Propuestos

### Componente: Interfaz y Lógica de Vistas

#### [MODIFY] index.html
- Añadir el botón de toggle para la vista Kanban en el `div#view-toggle`.

#### [MODIFY] css/table.css
- Añadir estilos para el tablero Kanban (`.kanban-board`, `.kanban-column`, `.kanban-column-header`, etc.).

#### [MODIFY] js/table.js
- Implementar la función `renderKanban(data)` que divida los eventos en columnas según su `status`.
- Integrar la llamada a `renderKanban(data)` dentro de la función principal `render()` según el `currentView`.

## Plan de Verificación

### Verificación Manual
- Abrir `index.html` en el navegador.
- Hacer clic en el nuevo botón Kanban.
- Verificar que los eventos se distribuyan en dos columnas: "Activos" e "Inactivos".
- Verificar que los estilos sean consistentes y responsive con el resto del diseño moderno.
- Probar el cambio de estado (dar de baja/reactivar) desde la vista Kanban para asegurar que la UI se refresque y las tarjetas cambien de columna.
