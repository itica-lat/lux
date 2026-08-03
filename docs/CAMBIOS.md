# Cambios aplicados y por qué estaban mal

Este documento explica los fixes hechos sobre `docs/sql/proyecto.sql` y `docs/sql/queries.sql`, y por qué el original no funcionaba o no cumplía lo pedido en `18+07+Actividad+SQL.pdf`.

`proyecto.sql` es el schema real del sistema. `queries.sql` **no es parte del sistema**: es la resolución de un ejercicio de práctica de SQL adaptado a ese schema.

## 1. Schema (`proyecto.sql`)

### 1.1 CHECK de longitud comparaba texto contra número
```sql
-- mal
CHECK (nombre >= 3)
-- bien
CHECK (LENGTH(nombre) BETWEEN 3 AND 200)
```
`nombre` es `VARCHAR`. MariaDB, al comparar un string contra un entero, intenta convertir el string a número. `'Oficina Central'` se convierte a `0` (no empieza con dígitos), y `0 >= 3` es falso, así que el CHECK rechazaba filas válidas por una coerción implícita, no por longitud real.

### 1.2 `equipo.estado` / `equipo.fallas` como JSON
El original guardaba el estado del equipo y sus fallas como JSON suelto dentro de la fila de `equipo`. Se normalizó a:
- `equipo.condicion`: columna `VARCHAR` con `CHECK` (`operativo`, `en_reparacion`, `de_baja`, `en_revision`).
- `falla`: tabla propia con FK a `equipo`.

Guardar fallas como JSON embebido impide hacer `JOIN`, `WHERE`, `COUNT` o `GROUP BY` sobre ellas sin parsear JSON en cada query — rompe justamente los ejercicios de filtrado y agrupamiento que pide la actividad.

## 2. Datos (`proyecto.sql` + inserts adicionales)

El script original insertaba 1-3 filas por tabla. Alcanzaba para que las tablas no estuvieran vacías, pero no para ejercitar todos los casos: no había tickets con todos los estados, ni equipos en todas las condiciones, ni tickets con la palabra "software", ni tickets recientes de prioridad alta. Se agregaron filas puntuales para cubrir esos casos (documentado en la conversación, no en un archivo aparte) sin tocar los datos originales.

## 3. Queries (`queries.sql`) — comparadas contra el PDF

El PDF pide 12 ejercicios sobre un modelo simplificado (`rol`, `usuario`, `equipo`, `ticket`, `prestamo`). Tu DB real (`lux`) tiene un modelo distinto: sin tabla `rol` (es un enum en `usuario.rol`), con `nombre`/`email` en `persona` (no en `usuario`), y con `tipo`/`marca`/`modelo` en `producto` (no en `equipo`). Cada adaptación tuvo que resolver esas diferencias de schema.

### 3.1 Sintaxis inválida
- `SELECT FROM ...` sin columnas → no es SQL válido, se cambió a `SELECT *`.
- `WHERE *` → no es sintaxis válida, se quitó.
- `ORDER BY ASC` sin nombre de columna → inválido, se quitó (no había criterio de orden claro en el original).
- Un `IF/ELSE` inline dentro del `SELECT` de "ticket con técnico" → no es sintaxis MariaDB; se reemplazó por `LEFT JOIN` + `COALESCE`, que es la forma correcta de traer un valor por defecto cuando el JOIN no matchea.

### 3.2 `LIKE 'software'` sin comodines (ejercicio 6)
`LIKE` sin `%` hace match exacto de toda la cadena, no búsqueda de substring. `LIKE 'software'` solo matchea una fila cuyo campo sea exactamente `"software"`. Se cambió a `LIKE '%software%'`.

### 3.3 "Filtrar Tickets Pendientes" filtraba por un valor que no existe (ejercicio 3)
```sql
-- mal
WHERE ticket.estado = 'pendiente'
```
El CHECK de `ticket.estado` en tu schema solo permite `'abierto'`, `'en_proceso'`, `'cerrado'`. `'pendiente'` no es un valor válido para esa columna — la query nunca iba a devolver una fila, sin importar cuántos datos hubiera. Se cambió a `estado = 'abierto'` (el equivalente real a "pendiente" en tu enum), y además se limitó el `SELECT *` a las columnas que pide el ejercicio (`ticket_id, titulo, estado, prioridad`).

### 3.4 "Prestamos activos" sin JOIN ni WHERE (ejercicio 9)
El original no filtraba por préstamo activo ni traía los datos de la persona/equipo. Se agregó `JOIN persona`, `JOIN equipo` y `WHERE fecha_dev_real IS NULL` (un préstamo activo es uno que todavía no fue devuelto). También le faltaba el **tipo de equipo**, que el enunciado pide explícitamente — se agregó `JOIN producto` para traerlo (`tipo` vive en `producto`, no en `equipo`).

### 3.5 "Tickets asignados a un técnico específico" mezclaba agregación sin agrupar (ejercicio 12)
```sql
-- mal: COUNT(*) junto a columnas sueltas sin GROUP BY
SELECT tecnico_id, persona.nombre, ticket.id, COUNT(*) ...
```
Mezclar una función de agregación (`COUNT(*)`) con columnas que no están agregadas ni en el `GROUP BY` es inválido (o da resultados sin sentido si el motor lo permite). Además, ticket no tiene `tecnico_id` directo — esa relación vive en `asignacion_tecnica`. Se separó en dos queries:
- Un listado simple de tickets por técnico (sin agregación), para el caso de uso original.
- Una query nueva y separada para el ejercicio 12 real: `GROUP BY tecnico_id` + `COUNT(*)` + `HAVING COUNT(*) >= 2`, que es justamente lo que pide el enunciado y no existía antes.

### 3.6 "Listar usuarios ordenados" no cumplía el ejercicio 2
```sql
-- mal
SELECT * FROM usuario ORDER BY id ASC;
```
El ejercicio pide `nombre`, `email` y `rol`, ordenados **alfabéticamente por nombre**. La query traía todas las columnas de `usuario` (que ni siquiera tiene `nombre`/`email` — están en `persona`) y ordenaba por `id`, no por nombre. Se agregó el `JOIN` a `persona` y se cambió el `ORDER BY` a `persona.nombre ASC`.

### 3.7 "Equipos disponibles" no traía tipo/marca/modelo/ubicación (ejercicio 5)
```sql
-- mal
SELECT * FROM equipo WHERE condicion = 'operativo' AND en_prestamo = 0;
```
El ejercicio pide `codigo, tipo, marca, modelo, ubicacion`. En tu schema esos datos están repartidos: `tipo`/`fabricante`/`modelo` en `producto`, el nombre de la ubicación en `ubicacion`. La query original solo mostraba las columnas propias de `equipo` (básicamente IDs de esas tablas, no los valores legibles). Se agregaron los `JOIN` correspondientes.

### 3.8 Query suelta sin ejercicio asociado
Había una query "Filtrar Ticket por prioridad y fecha" que solo hacía `ORDER BY prioridad, fecha_creacion` sin ningún `WHERE` — no correspondía a ninguno de los 12 ejercicios del PDF (parece un borrador duplicado del ejercicio 4, que sí tiene su propio filtro por prioridad+fecha). Se eliminó.

## 4. Estado final

Con estos cambios, `queries.sql` cubre los 12 ejercicios del PDF adaptados al schema real de `lux`, todos verificados corriendo contra la base de datos.
