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
