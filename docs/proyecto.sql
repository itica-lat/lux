CREATE DATABASE IF NOT EXISTS lux;
USE lux;

CREATE TABLE IF NOT EXISTS ubicacion (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    nombre VARCHAR(200) UNIQUE
);

CREATE TABLE IF NOT EXISTS producto (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    modelo VARCHAR(1000),
    fabricante VARCHAR(1000),
    tipo VARCHAR(100),
    nro_parte VARCHAR(1000) UNIQUE
);

CREATE TABLE IF NOT EXISTS persona (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    dni VARCHAR(50) UNIQUE,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    email VARCHAR(500) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuario (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    persona_id VARCHAR(100) UNIQUE,
    password_hash VARCHAR(2000),
    rol VARCHAR(100),
    fecha_baja DATE,
    activo BOOLEAN,
    CONSTRAINT fk_usuario_persona_id FOREIGN KEY (persona_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS equipo (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    producto_id VARCHAR(100),
    nro_serie VARCHAR(1000),
    estado JSON,
    fallas JSON,
    en_prestamo BOOLEAN,
    ubicacion_id VARCHAR(100),
    CONSTRAINT fk_equipo_producto_id FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_equipo_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

CREATE TABLE IF NOT EXISTS ticket (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitante_id VARCHAR(100),
    equipo_id VARCHAR(100),
    ubicacion_id VARCHAR(100),
    titulo VARCHAR(200),
    fecha_creacion DATE,
    prioridad VARCHAR(100),
    estado VARCHAR(100),
    descripcion VARCHAR(2000),
    categoria VARCHAR(100),
    CONSTRAINT fk_ticket_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id),
    CONSTRAINT fk_ticket_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_ticket_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

CREATE TABLE IF NOT EXISTS prestamo (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitante_id VARCHAR(100),
    equipo_id VARCHAR(100),
    expedido_por_id VARCHAR(100),
    expedido BOOLEAN,
    fecha_entrega DATE,
    fecha_devolucion_pactada DATE,
    fecha_dev_real DATE,
    CONSTRAINT fk_prestamo_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_prestamo_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id),
    CONSTRAINT fk_prestamo_expedido_por_id FOREIGN KEY (expedido_por_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS asignacion (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    equipo_id VARCHAR(100),
    persona_id VARCHAR(100),
    fecha_desde DATE,
    fecha_hasta DATE,
    motivo VARCHAR(1000),
    CONSTRAINT fk_asignacion_persona_id FOREIGN KEY (persona_id) REFERENCES persona(id),
    CONSTRAINT fk_asignacion_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS asignacion_tecnica (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    ticket_id VARCHAR(100),
    tecnico_id VARCHAR(100),
    fecha_planificada DATE,
    fecha_asignacion DATE,
    activa BOOLEAN,
    estado_ejecucion VARCHAR(100),
    motivo_reasignacion VARCHAR(1000),
    CONSTRAINT fk_asigtec_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id),
    CONSTRAINT fk_asigtec_ticket_id FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

CREATE TABLE IF NOT EXISTS nota_tecnica (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    equipo_id VARCHAR(100),
    tecnico_id VARCHAR(100),
    ticket_id VARCHAR(100),
    contenido VARCHAR(1000),
    timestamp DATETIME,
    CONSTRAINT fk_nota_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_nota_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id),
    CONSTRAINT fk_nota_ticket_id FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

CREATE TABLE IF NOT EXISTS solicitud_servicio (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitante_id VARCHAR(100),
    descripcion VARCHAR(200),
    fecha_requerida DATE,
    tipo VARCHAR(100),
    estado VARCHAR(100),
    CONSTRAINT fk_solserv_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS solicitud_detalle (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitud_id VARCHAR(100),
    ubicacion_id VARCHAR(100),
    equipo_id VARCHAR(100),
    software JSON,
    especificacion VARCHAR(1000),
    CONSTRAINT fk_detalle_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_detalle_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id),
    CONSTRAINT fk_detalle_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS asignacion_solicitud (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitud_id VARCHAR(100),
    tecnico_id VARCHAR(100),
    fecha_planificada DATE,
    observaciones VARCHAR(1000),
    CONSTRAINT fk_asigsol_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_asigsol_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS solicitud_recurso_fisico (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitud_id VARCHAR(100),
    equipo_id VARCHAR(100),
    observacion VARCHAR(2000),
    CONSTRAINT fk_recfisico_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_recfisico_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS solicitud_recurso_logico (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    solicitud_id VARCHAR(100),
    descripcion VARCHAR(2000),
    CONSTRAINT fk_reclogico_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id)
);

-- entidad_id es una referencia polimorfica (Ticket, Equipo, Prestamo, etc.
-- segun el valor de "entidad"), por eso no lleva FK real.
CREATE TABLE IF NOT EXISTS log_auditoria (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    entidad VARCHAR(100),
    entidad_id VARCHAR(100),
    accion VARCHAR(100),
    datos_json JSON,
    usuario_id VARCHAR(100),
    timestamp DATETIME,
    CONSTRAINT fk_log_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- ============================================================
-- Datos de prueba
-- Insertados en orden de dependencia (FK) para evitar errores.
-- ============================================================

INSERT INTO ubicacion (id, nombre) VALUES
('UBI-01', 'Oficina Central'),
('UBI-02', 'Depósito Norte'),
('UBI-03', 'Sucursal Este'),
('UBI-04', 'Sala de Servidores'),
('UBI-05', 'Mesa de Ayuda');

INSERT INTO producto (id, modelo, fabricante, tipo, nro_parte) VALUES
('PROD-01', 'Latitude 5420', 'Dell', 'Notebook', 'DELL-L5420-001'),
('PROD-02', 'ThinkPad T14', 'Lenovo', 'Notebook', 'LEN-T14-002'),
('PROD-03', 'LaserJet Pro M404', 'HP', 'Impresora', 'HP-M404-003'),
('PROD-04', 'Catalyst 2960', 'Cisco', 'Switch', 'CIS-2960-004'),
('PROD-05', 'iPhone 13', 'Apple', 'Celular', 'APL-IP13-005');

INSERT INTO persona (id, dni, nombre, apellido, email) VALUES
('PER-01', '11111111', 'Facundo', 'Pérez', 'facundo.perez@lux.com'),
('PER-02', '22222222', 'Lucía', 'Gómez', 'lucia.gomez@lux.com'),
('PER-03', '33333333', 'Martín', 'Fernández', 'martin.fernandez@lux.com'),
('PER-04', '44444444', 'Ana', 'Rodríguez', 'ana.rodriguez@lux.com'),
('PER-05', '55555555', 'Diego', 'Suárez', 'diego.suarez@lux.com'),
('PER-06', '66666666', 'Valentina', 'López', 'valentina.lopez@lux.com'),
('PER-07', '77777777', 'David', 'Castro', 'david.castro@lux.com');

INSERT INTO usuario (id, persona_id, password_hash, rol, fecha_baja, activo) VALUES
('USR-01', 'PER-01', '$2b$10$abcdefghijklmnopqrstuv0001', 'admin', NULL, TRUE),
('USR-02', 'PER-02', '$2b$10$abcdefghijklmnopqrstuv0002', 'tecnico', NULL, TRUE),
('USR-03', 'PER-03', '$2b$10$abcdefghijklmnopqrstuv0003', 'tecnico', NULL, TRUE),
('USR-04', 'PER-04', '$2b$10$abcdefghijklmnopqrstuv0004', 'usuario', NULL, TRUE),
('USR-05', 'PER-07', '$2b$10$abcdefghijklmnopqrstuv0005', 'usuario', '2026-06-15', FALSE);

INSERT INTO equipo (id, producto_id, nro_serie, estado, fallas, en_prestamo, ubicacion_id) VALUES
('EQ-01', 'PROD-01', 'SN-DELL-0001', '{"condicion":"operativo"}', '[]', FALSE, 'UBI-01'),
('EQ-02', 'PROD-02', 'SN-LEN-0002', '{"condicion":"operativo"}', '[]', TRUE, 'UBI-02'),
('EQ-03', 'PROD-03', 'SN-HP-0003', '{"condicion":"en_reparacion"}', '["atasco de papel"]', FALSE, 'UBI-01'),
('EQ-04', 'PROD-04', 'SN-CIS-0004', '{"condicion":"operativo"}', '[]', FALSE, 'UBI-04'),
('EQ-05', 'PROD-05', 'SN-APL-0005', '{"condicion":"operativo"}', '[]', TRUE, 'UBI-03'),
('EQ-06', 'PROD-01', 'SN-DELL-0006', '{"condicion":"fuera_de_servicio"}', '["pantalla rota", "no enciende"]', FALSE, 'UBI-02');

INSERT INTO ticket (id, solicitante_id, equipo_id, ubicacion_id, titulo, fecha_creacion, prioridad, estado, descripcion, categoria) VALUES
('TCK-01', 'PER-04', 'EQ-03', 'UBI-01', 'Impresora no imprime', '2026-07-01', 'alta', 'abierto', 'La impresora HP presenta atasco constante de papel.', 'hardware'),
('TCK-02', 'PER-05', 'EQ-06', 'UBI-02', 'Notebook no enciende', '2026-07-05', 'critica', 'en_proceso', 'El equipo no enciende luego de una caída.', 'hardware'),
('TCK-03', 'PER-06', NULL, 'UBI-03', 'Solicitud de instalación de software', '2026-07-10', 'media', 'abierto', 'Se requiere instalar suite ofimática.', 'software'),
('TCK-04', 'PER-04', 'EQ-01', 'UBI-01', 'Lentitud en notebook', '2026-07-15', 'baja', 'cerrado', 'El equipo presenta lentitud general.', 'rendimiento'),
('TCK-05', 'PER-05', 'EQ-04', 'UBI-04', 'Switch pierde conectividad', '2026-07-20', 'alta', 'en_proceso', 'El switch principal pierde paquetes intermitentemente.', 'red');

INSERT INTO prestamo (id, solicitante_id, equipo_id, expedido_por_id, expedido, fecha_entrega, fecha_devolucion_pactada, fecha_dev_real) VALUES
('PRE-01', 'PER-05', 'EQ-02', 'PER-02', TRUE, '2026-06-01', '2026-07-01', NULL),
('PRE-02', 'PER-06', 'EQ-05', 'PER-03', TRUE, '2026-07-10', '2026-08-10', NULL),
('PRE-03', 'PER-04', 'EQ-01', 'PER-02', TRUE, '2026-05-01', '2026-05-15', '2026-05-14');

INSERT INTO asignacion (id, equipo_id, persona_id, fecha_desde, fecha_hasta, motivo) VALUES
('ASG-01', 'EQ-01', 'PER-04', '2026-01-10', NULL, 'Asignación de equipo de trabajo'),
('ASG-02', 'EQ-04', 'PER-01', '2025-11-01', NULL, 'Equipo de red asignado a administración'),
('ASG-03', 'EQ-06', 'PER-05', '2025-08-01', '2026-07-05', 'Baja por rotura de pantalla');

INSERT INTO asignacion_tecnica (id, ticket_id, tecnico_id, fecha_planificada, fecha_asignacion, activa, estado_ejecucion, motivo_reasignacion) VALUES
('AST-01', 'TCK-01', 'PER-02', '2026-07-02', '2026-07-01', TRUE, 'pendiente', NULL),
('AST-02', 'TCK-02', 'PER-03', '2026-07-06', '2026-07-05', TRUE, 'en_curso', NULL),
('AST-03', 'TCK-05', 'PER-02', '2026-07-21', '2026-07-20', TRUE, 'pendiente', 'Reasignado por disponibilidad del técnico anterior');

INSERT INTO nota_tecnica (id, equipo_id, tecnico_id, ticket_id, contenido, timestamp) VALUES
('NOTA-01', 'EQ-03', 'PER-02', 'TCK-01', 'Se revisó el rodillo de arrastre, requiere repuesto.', '2026-07-02 10:15:00'),
('NOTA-02', 'EQ-06', 'PER-03', 'TCK-02', 'Diagnóstico preliminar: posible falla en la placa madre.', '2026-07-06 09:30:00'),
('NOTA-03', 'EQ-04', 'PER-02', 'TCK-05', 'Se reinició el equipo, se realizará seguimiento.', '2026-07-21 14:00:00');

INSERT INTO solicitud_servicio (id, solicitante_id, descripcion, fecha_requerida, tipo, estado) VALUES
('SOL-01', 'PER-06', 'Instalación de software ofimático', '2026-07-25', 'instalacion', 'pendiente'),
('SOL-02', 'PER-01', 'Compra de nuevos equipos para depósito', '2026-08-01', 'adquisicion', 'aprobada'),
('SOL-03', 'PER-04', 'Reparación de impresora', '2026-07-28', 'reparacion', 'en_proceso');

INSERT INTO solicitud_detalle (id, solicitud_id, ubicacion_id, equipo_id, software, especificacion) VALUES
('DET-01', 'SOL-01', 'UBI-03', NULL, '["Microsoft Office", "Adobe Reader"]', 'Instalar en equipo de recepción'),
('DET-02', 'SOL-02', 'UBI-02', NULL, NULL, 'Se requieren 3 notebooks nuevas'),
('DET-03', 'SOL-03', 'UBI-01', 'EQ-03', NULL, 'Cambio de rodillo de arrastre');

INSERT INTO asignacion_solicitud (id, solicitud_id, tecnico_id, fecha_planificada, observaciones) VALUES
('ASGSOL-01', 'SOL-01', 'PER-03', '2026-07-26', 'Coordinar con recepción antes de instalar'),
('ASGSOL-02', 'SOL-03', 'PER-02', '2026-07-29', 'Traer repuesto de rodillo');

INSERT INTO solicitud_recurso_fisico (id, solicitud_id, equipo_id, observacion) VALUES
('RECF-01', 'SOL-02', NULL, 'Se solicitan notebooks Dell Latitude o equivalente'),
('RECF-02', 'SOL-03', 'EQ-03', 'Impresora HP a reparar en sala de servidores');

INSERT INTO solicitud_recurso_logico (id, solicitud_id, descripcion) VALUES
('RECL-01', 'SOL-01', 'Licencias de Microsoft Office 365'),
('RECL-02', 'SOL-02', 'Licencias de antivirus corporativo para nuevos equipos');

INSERT INTO log_auditoria (id, entidad, entidad_id, accion, datos_json, usuario_id, timestamp) VALUES
('LOG-01', 'ticket', 'TCK-01', 'crear', '{"estado":"abierto"}', 'USR-04', '2026-07-01 08:00:00'),
('LOG-02', 'ticket', 'TCK-02', 'crear', '{"estado":"en_proceso"}', 'USR-01', '2026-07-05 11:20:00'),
('LOG-03', 'prestamo', 'PRE-01', 'crear', '{"expedido":true}', 'USR-02', '2026-06-01 09:00:00'),
('LOG-04', 'equipo', 'EQ-06', 'actualizar_estado', '{"condicion":"fuera_de_servicio"}', 'USR-01', '2026-07-05 12:00:00'),
('LOG-05', 'solicitud_servicio', 'SOL-02', 'aprobar', '{"estado":"aprobada"}', 'USR-01', '2026-07-15 16:45:00');
