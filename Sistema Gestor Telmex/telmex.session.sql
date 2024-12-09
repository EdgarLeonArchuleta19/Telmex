CREATE TABLE departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE temas_departamento (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  departamento_id INT REFERENCES departamentos(id) ON DELETE CASCADE
);


CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  tipo VARCHAR(20) CHECK (tipo IN ('administrador', 'tecnico', 'usuarioNormal')),
  departamento_id INT REFERENCES departamentos(id) -- El departamento al que pertenece el técnico
);



CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id), -- Usuario que creó el ticket
  tecnico_id INT REFERENCES usuarios(id), -- Técnico asignado al ticket
  departamento_id INT REFERENCES departamentos(id), -- Departamento asignado
  tema_id INT REFERENCES temas_departamento(id), -- Tema específico del ticket
  descripcion TEXT NOT NULL,
  prioridad VARCHAR(20) CHECK (prioridad IN ('baja', 'media', 'alta')),
  estado VARCHAR(20) CHECK (estado IN ('abierto', 'en proceso', 'resuelto', 'cerrado')),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP,
  problema_id INT REFERENCES problemas(id)

);

CREATE TABLE historial_tickets (
  id SERIAL PRIMARY KEY,
  ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
  tecnico_id INT REFERENCES usuarios(id), -- Técnico asignado al ticket
  cambio TEXT, -- Descripción del cambio
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE problemas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'Abierto', -- Abierto, En Análisis, Resuelto
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tecnico_asignado INTEGER REFERENCES usuarios(id),
    solucion TEXT
);



-- Función para crear un problema y actualizar tickets relacionados
CREATE OR REPLACE FUNCTION crear_problema_y_actualizar_tickets(
    p_titulo VARCHAR(255),
    p_descripcion TEXT,
    p_tickets_ids INT[]
) RETURNS INT AS $$
DECLARE
    v_problema_id INT;
    v_tecnico_problemas_id INT;
    v_ticket_record RECORD;
BEGIN
    -- Obtener el ID del técnico de problemas
    SELECT id INTO v_tecnico_problemas_id
    FROM usuarios
    WHERE username = 'tecnico_problemas'
    LIMIT 1;

    -- Verificar que existe el técnico de problemas
    IF v_tecnico_problemas_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el técnico de problemas';
    END IF;

    -- Crear el nuevo problema
    INSERT INTO problemas (
        titulo,
        descripcion,
        estado,
        tecnico_asignado
    ) VALUES (
        p_titulo,
        p_descripcion,
        'Abierto',
        v_tecnico_problemas_id
    ) RETURNING id INTO v_problema_id;

    -- Actualizar los tickets relacionados
    UPDATE tickets
    SET problema_id = v_problema_id,
        estado = 'en proceso'  -- Actualizamos el estado del ticket
    WHERE id = ANY(p_tickets_ids);

    -- Registrar en el historial de cada ticket
    FOR v_ticket_record IN 
        SELECT id, tecnico_id 
        FROM tickets 
        WHERE id = ANY(p_tickets_ids)
    LOOP
        INSERT INTO historial_tickets (
            ticket_id,
            tecnico_id,
            cambio
        ) VALUES (
            v_ticket_record.id,
            v_ticket_record.tecnico_id,
            'Ticket vinculado al problema general #' || v_problema_id || ': ' || p_titulo || 
            '. El caso ha sido escalado a gestión de problemas.'
        );
    END LOOP;

    RETURN v_problema_id;
END;
$$ LANGUAGE plpgsql;


update tickets set estado = 'resuelto' where id = 14;


select * from departamentos

INSERT INTO departamentos (nombre, descripcion)
VALUES
('Cambios', 'Gestión de cambios en infraestructura y servicios'),
('Configuraciones', 'Gestión y configuración de dispositivos y servicios de red'),
('Problemas', 'Gestión de problemas recurrentes derivados de incidencias'),
('Hardware', 'Gestión de dispositivos físicos, como módems y routers'),
('Soporte Técnico', 'Atención a usuarios con problemas técnicos generales'),
('Redes', 'Gestión y mantenimiento de la red de telecomunicaciones'),
('Seguridad', 'Supervisión y gestión de la seguridad de los sistemas y datos');



select 

INSERT INTO temas_departamento (nombre, departamento_id)
VALUES
-- Temas para el departamento de Cambios
('Quiero hacer un cambio', 1),
('Aprobación de cambios', 1),
('Seguimiento de cambios', 1),

-- Temas para el departamento de Configuraciones
('Configuración de módem', 2),
('Cambio de contraseñas Wi-Fi', 2),
('Actualización de firmware', 2),

-- Temas para el departamento de Incidencias
('Internet lento', 3),
('Fallas intermitentes', 3),
('Sin conexión', 3),

-- Temas para el departamento de Problemas
('Falla recurrente en nodo', 4),
('Interrupciones frecuentes', 4),

-- Temas para el departamento de Hardware
('Módem dañado', 5),
('Falla en el cableado', 5),

-- Temas para el departamento de Soporte Técnico
('Problemas de software', 6),
('Asistencia remota', 6),

-- Temas para el departamento de Redes
('Interrupción en red local', 7),
('Mantenimiento de enlaces', 7),

-- Temas para el departamento de Seguridad
('Acceso no autorizado', 8),
('Actualización de políticas de seguridad', 8);


INSERT INTO usuarios (username, password, nombre, tipo, departamento_id)
VALUES
-- Administrador
('admin', 'admin123', 'Administrador General', 'administrador', NULL),

-- Técnicos (1 por departamento)
('tecnico_cambios', 'cambio123', 'Técnico de Cambios', 'tecnico', 1),
('tecnico_config', 'config123', 'Técnico de Configuraciones', 'tecnico', 2),
('tecnico_incidencias', 'incidencias123', 'Técnico de Incidencias', 'tecnico', 3),
('tecnico_problemas', 'problemas123', 'Técnico de Problemas', 'tecnico', 4),
('tecnico_hardware', 'hardware123', 'Técnico de Hardware', 'tecnico', 5),
('tecnico_soporte', 'soporte123', 'Técnico de Soporte Técnico', 'tecnico', 6),
('tecnico_redes', 'redes123', 'Técnico de Redes', 'tecnico', 7),
('tecnico_seguridad', 'seguridad123', 'Técnico de Seguridad', 'tecnico', 8),




-- Usuarios normales
('usuario1', 'usuario123', 'Juan Pérez', 'usuarioNormal', NULL),
('usuario2', 'usuario456', 'Ana García', 'usuarioNormal', NULL),
('usuario3', 'usuario789', 'Luis Martínez', 'usuarioNormal', NULL);
