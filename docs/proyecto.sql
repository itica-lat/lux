CREATE DATABASE IF NOT EXISTS lux;
USE DATABASE lux;

CREATE TABLE IF NOT EXISTS persona (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    mail VARCHAR(500) NOT NULL UNIQUE,
    dni VARCHAR(50) UNIQUE,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    id_usuario VARCHAR(100),
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS usuario (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha_baja DATE,
    password_hash VARCHAR(2000),
    activo BOOLEAN,
    rol VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS log_auditoria (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    datos_json JSON,
    hora TIMESTAMP,
    accion VARCHAR(100),
    entidad_id VARCHAR(100),
    generado_por_id VARCHAR(100),
    CONSTRAINT fk_entidad_id FOREIGN KEY (entidad_id) REFERENCES entidad(id),
    CONSTRAINT fk_generado_por_id FOREIGN KEY (generado_por_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS prestamo (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha_devolucion DATE,
    fecha_entrega DATE,
    expedido BOOLEAN,
    fecha_dev_real DATE,
    equipo_id VARCHAR(100),
    solicitante_id VARCHAR(100),
    expedido_por_id VARCHAR(100),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id), 
    CONSTRAINT fk_expedido_por_id FOREIGN KEY (expedido_por_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS asignacion (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha_desde DATE,
    fecha_hasta DATE,
    motivo VARCHAR(1000),
    persona_id VARCHAR(100),
    equipo_id VARCHAR(100),
    CONSTRAINT fk_persona_id FOREIGN KEY (persona_id) REFERENCES persona(id),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS asignacion_tecnica (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha_asignacion DATE,
    activa BOOLEAN,
    estado_ejecucion VARCHAR(100),
    fecha_planificada DATE,
    motivo_reasignacion VARCHAR(1000),
    tecnico_id VARCHAR(100),
    ticket_id VARCHAR(100) 
    CONSTRAINT fk_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id),
    CONSTRAINT fk_ticket_id FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

CREATE TABLE IF NOT EXISTS solicitud_detalle (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    software JSON,
    especificacion VARCHAR(1000),
    solicitud_id VARCHAR(100),
    ubicacion_id VARCHAR(100),
    equipo_id VARCHAR(100),
    CONSTRAINT fk_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS nota_tecnica (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha TIMESTAMP,
    contenido VARCHAR(1000),
    equipo_id VARCHAR(100),
    tecnico_id VARCHAR(100), 
    ticket_id VARCHAR(100), 
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id),
    CONSTRAINT fk_ticket_id FOREIGN KEY (ticket_id) REFERENCES ticket(id)
);

CREATE TABLE IF NOT EXISTS equipo (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    en_prestamo BOOLEAN,
    nro_serie VARCHAR(1000),
    estado JSON,
    fallas JSON,
    producto_id VARCHAR(100),
    ubicacion_id VARCHAR(100),
    CONSTRAINT fk_producto_id FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

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

CREATE TABLE IF NOT EXISTS ticket (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    fecha_creacion DATE,
    prioridad VARCHAR(100),
    estado VARCHAR(100),
    descripcion VARCHAR(2000),
    categoria VARCHAR(100),
    titulo VARCHAR(200),
    contenido VARCHAR(2000),
    solicitante_id VARCHAR(100),
    equipo_id VARCHAR(100),
    ubicacion_id VARCHAR(100), 
    CONSTRAINT fk_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id),
    CONSTRAINT fk_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

CREATE TABLE IF NOT EXISTS solicitud_servicio (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    tipo VARCHAR(100),
    descripcion VARCHAR(200),
    estado VARCHAR(100),
    fecha_requerida DATE,
    solicitante_id VARCHAR(100),
    CONSTRAINT fk_solicitante_id FOREIGN KEY (solicitante_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS asignacion_solicitud (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    observaciones VARCHAR(1000),
    fecha_planificada DATE,
    solicitud_id VARCHAR(100),
    tecnico_id VARCHAR(100),
    CONSTRAINT fk_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_tecnico_id FOREIGN KEY (tecnico_id) REFERENCES persona(id)
);

CREATE TABLE IF NOT EXISTS solicitud_servicio_logico (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    descripcion VARCHAR(2000),
    solicitud_id VARCHAR(100),
    CONSTRAINT fk_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id)
);

CREATE TABLE IF NOT EXISTS solicitud_servicio_fisico (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    observacion VARCHAR(2000),
    solicitud_id VARCHAR(100),
    equipo_id VARCHAR(100),
    CONSTRAINT fk_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

CREATE TABLE IF NOT EXISTS solicitud_detalle (
    id VARCHAR(100) PRIMARY KEY NOT NULL,
    software JSON,
    especificacion VARCHAR(2000),
    solicitud_id VARCHAR(100),
    ubicacion_id VARCHAR(100),
    equipo_id VARCHAR(100),
    CONSTRAINT fk_solicitud_id FOREIGN KEY (solicitud_id) REFERENCES solicitud_servicio(id),
    CONSTRAINT fk_ubicacion_id FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id),
    CONSTRAINT fk_equipo_id FOREIGN KEY (equipo_id) REFERENCES equipo(id)
);

