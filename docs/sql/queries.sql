
USE lux;

-- Listar Tickets

SELECT * FROM ticket;

-- Listar usuarios ordenados

SELECT persona.nombre, persona.email, usuario.rol
FROM usuario
JOIN persona ON usuario.persona_id = persona.id
ORDER BY persona.nombre ASC;

-- Filtrar Tickets Pendientes

SELECT ticket.id AS ticket_id, ticket.titulo, ticket.estado, ticket.prioridad
FROM ticket
WHERE ticket.estado = 'abierto'
ORDER BY ticket.fecha_creacion DESC;

-- Filtrar por Prioridad y fecha (Tarea)

SELECT * FROM ticket WHERE ticket.prioridad = 'alta' AND ticket.fecha_creacion >= '2026-07-10';

-- Equipos disponibles

SELECT
    equipo.id AS codigo,
    producto.tipo,
    producto.fabricante AS marca,
    producto.modelo,
    ubicacion.nombre AS ubicacion
FROM equipo
JOIN producto ON equipo.producto_id = producto.id
JOIN ubicacion ON equipo.ubicacion_id = ubicacion.id
WHERE equipo.condicion = 'operativo' AND equipo.en_prestamo = 0;

-- Buscar por texto

SELECT * FROM ticket WHERE ticket.descripcion LIKE '%software%' OR ticket.titulo LIKE '%software%';

-- Usuario con su rol

SELECT persona.nombre, persona.apellido, usuario.rol
FROM usuario
JOIN persona ON usuario.persona_id = persona.id;

-- Ticket con solicitante y tecnico

SELECT
    ticket.id,
    ticket.titulo,
    solicitante.nombre AS solicitante_nombre,
    solicitante.apellido AS solicitante_apellido,
    COALESCE(tecnico.nombre, 'No asignado') AS tecnico_nombre,
    COALESCE(tecnico.apellido, 'No asignado') AS tecnico_apellido
FROM ticket
JOIN persona AS solicitante ON ticket.solicitante_id = solicitante.id
LEFT JOIN asignacion_tecnica ON asignacion_tecnica.ticket_id = ticket.id AND asignacion_tecnica.activa = 1
LEFT JOIN persona AS tecnico ON asignacion_tecnica.tecnico_id = tecnico.id;

-- Prestamos activos

SELECT
    prestamo.id,
    prestamo.fecha_entrega,
    prestamo.fecha_devolucion_pactada,
    persona.nombre AS solicitante_nombre,
    persona.apellido AS solicitante_apellido,
    equipo.nro_serie,
    producto.tipo AS tipo_equipo
FROM prestamo
JOIN persona ON prestamo.solicitante_id = persona.id
JOIN equipo ON prestamo.equipo_id = equipo.id
JOIN producto ON equipo.producto_id = producto.id
WHERE prestamo.fecha_dev_real IS NULL;

-- Cantidad de tickets por estado

SELECT ticket.estado, COUNT(*) AS cantidad_tickets
FROM ticket
GROUP BY ticket.estado;

-- Promedio de horas por prioridad de tickets

SELECT ticket.prioridad, AVG(TIMESTAMPDIFF(HOUR, ticket.fecha_creacion, NOW())) AS promedio_horas
FROM ticket
GROUP BY ticket.prioridad;

-- Tickets asignados a un tecnico especifico

SELECT
    asignacion_tecnica.tecnico_id,
    persona.nombre AS tecnico_nombre,
    persona.apellido AS tecnico_apellido,
    ticket.id AS ticket_id,
    ticket.titulo
FROM asignacion_tecnica
JOIN persona ON asignacion_tecnica.tecnico_id = persona.id
JOIN ticket ON asignacion_tecnica.ticket_id = ticket.id
WHERE asignacion_tecnica.activa = 1;

-- Tickets por tecnico con HAVING

SELECT
    persona.nombre AS tecnico_nombre,
    persona.apellido AS tecnico_apellido,
    COUNT(*) AS cantidad_tickets
FROM asignacion_tecnica
JOIN persona ON asignacion_tecnica.tecnico_id = persona.id
GROUP BY asignacion_tecnica.tecnico_id, persona.nombre, persona.apellido
HAVING COUNT(*) >= 2;
