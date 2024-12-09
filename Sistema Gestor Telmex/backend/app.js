// Importar módulos necesarios
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Crear la aplicación de Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "telmex",
  password: process.env.DB_PASSWORD || "1234",
  port: process.env.DB_PORT || 5432,
});

// Verificar la conexión con la base de datos
pool.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos PostgreSQL");
  }
});


// Rutas básicas
app.get("/", (req, res) => {
  res.send("API del Proyecto Telmex está activa");
});









// API para iniciar sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Validar datos de entrada
    if (!username || !password) {
        return res.status(400).json({ error: 'Por favor, ingresa un usuario y contraseña.' });
    }

    try {
        // Consulta SQL para verificar el usuario
        const query = `
            SELECT id, username, nombre, tipo, departamento_id
            FROM usuarios
            WHERE username = $1 AND password = $2
        `;
        const result = await pool.query(query, [username, password]);

        if (result.rows.length > 0) {
            const usuario = result.rows[0];
            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                usuario: {
                    id: usuario.id,
                    username: usuario.username,
                    nombre: usuario.nombre,
                    tipo: usuario.tipo,
                    departamento_id: usuario.departamento_id,
                }
            });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




//APIS CREAR TICKETS:

// Backend API endpoints (Node.js/Express)
app.post('/api/tickets', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Obtener el técnico con menos tickets del departamento correspondiente
      const tecnicoResult = await client.query(
        `SELECT u.id, u.nombre
         FROM usuarios u
         LEFT JOIN (
           SELECT tecnico_id, COUNT(*) as ticket_count
           FROM tickets
           WHERE estado NOT IN ('resuelto', 'cerrado')
           GROUP BY tecnico_id
         ) t ON u.id = t.tecnico_id
         WHERE u.tipo = 'tecnico'
         AND u.departamento_id = $1
         ORDER BY COALESCE(t.ticket_count, 0) ASC
         LIMIT 1`,
        [req.body.departamento_id]
      );
  
      if (tecnicoResult.rows.length === 0) {
        throw new Error('No hay técnicos disponibles en este departamento');
      }
  
      const tecnicoAsignado = tecnicoResult.rows[0];
  
      // Insertar el ticket con el técnico asignado
      const ticketResult = await client.query(
        `INSERT INTO tickets (
          usuario_id, tecnico_id, departamento_id, tema_id, 
          descripcion, estado, prioridad, fecha_creacion
        ) VALUES ($1, $2, $3, $4, $5, 'abierto', 'media', CURRENT_TIMESTAMP)
        RETURNING id, fecha_creacion`,
        [
          req.body.usuario_id,
          tecnicoAsignado.id,
          req.body.departamento_id,
          req.body.tema_id,
          req.body.descripcion
        ]
      );
  
      // Registrar la creación en el historial
      await client.query(
        `INSERT INTO historial_tickets (
          ticket_id, tecnico_id, cambio, fecha
        ) VALUES ($1, $2, $3, $4)`,
        [
          ticketResult.rows[0].id,
          tecnicoAsignado.id,
          `Ticket creado y asignado automáticamente al agente: ${tecnicoAsignado.nombre}`,
          ticketResult.rows[0].fecha_creacion
        ]
      );
  
      await client.query('COMMIT');
      res.json({
        success: true,
        ticket_id: ticketResult.rows[0].id,
        tecnico_asignado: {
          id: tecnicoAsignado.id,
          nombre: tecnicoAsignado.nombre
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });


  // 3. Obtener tickets del usuario con estado filtrado
  app.get('/api/tickets/:usuario_id', async (req, res) => {
    try {
      const ticketsResult = await pool.query(
        `SELECT t.*, d.nombre as departamento, td.nombre as tema,
                u.nombre as tecnico_nombre
         FROM tickets t
         LEFT JOIN departamentos d ON t.departamento_id = d.id
         LEFT JOIN temas_departamento td ON t.tema_id = td.id
         LEFT JOIN usuarios u ON t.tecnico_id = u.id
         WHERE t.usuario_id = $1
         ORDER BY t.fecha_creacion DESC`,
        [req.params.usuario_id]
      );
      
      res.json({ tickets: ticketsResult.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // 4. Obtener historial de un ticket
  app.get('/api/tickets/:id/historial', async (req, res) => {
    try {
      const historialResult = await pool.query(
        `SELECT h.*, u.nombre as tecnico_nombre
         FROM historial_tickets h
         LEFT JOIN usuarios u ON h.tecnico_id = u.id
         WHERE h.ticket_id = $1
         ORDER BY h.fecha DESC`,
        [req.params.id]
      );
      
      res.json({ historial: historialResult.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


  app.get('/api/departamentos', async (req, res) => {
    try {
        const query = `
            SELECT * 
            FROM departamentos 
            WHERE nombre != 'Problemas' 
            ORDER BY nombre ASC;
        `;
        const result = await pool.query(query);

        res.status(200).json({ departamentos: result.rows });
    } catch (error) {
        console.error("Error al obtener los departamentos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});




app.get('/api/temas/:departamento_id', async (req, res) => {
    const { departamento_id } = req.params;

    try {
        const query = `
            SELECT * 
            FROM temas_departamento 
            WHERE departamento_id = $1 
            ORDER BY nombre ASC;
        `;
        const result = await pool.query(query, [departamento_id]);

        res.status(200).json({ temas: result.rows });
    } catch (error) {
        console.error("Error al obtener los temas del departamento:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Cerrar ticket
app.post('/api/tickets/:id/cerrar', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar estado del ticket
      await client.query(
        `UPDATE tickets 
         SET estado = 'cerrado'
         WHERE id = $1`,
        [req.params.id]
      );
  
      // Registrar en historial
      await client.query(
        `INSERT INTO historial_tickets (
          ticket_id, cambio, fecha
        ) VALUES ($1, 'Ticket cerrado por confirmación del cliente', CURRENT_TIMESTAMP)`,
        [req.params.id]
      );
  
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });
  
  app.post('/api/tickets/:id/rechazar', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Actualizar el estado del ticket a "en proceso"
      await client.query(
        `UPDATE tickets 
         SET estado = 'abierto'
         WHERE id = $1`,
        [req.params.id]
      );
  
      // Registrar en el historial el motivo de reapertura proporcionado por el cliente
      const motivo = req.body.motivo || 'Sin motivo especificado';
      await client.query(
        `INSERT INTO historial_tickets (
          ticket_id, cambio, fecha
        ) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [req.params.id, `Ticket reabierto por el cliente. Motivo: ${motivo}`]
      );
  
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  });
  



























//APIS TICKETS ASIGNADOS:

app.get('/api/tickets/asignados/:tecnico_id', async (req, res) => {
  const { tecnico_id } = req.params;  // Recibir el ID del técnico desde los parámetros de la URL

  try {
    const result = await pool.query(`
      SELECT t.id, t.descripcion, t.estado, t.prioridad, t.fecha_creacion, u.nombre AS cliente
      FROM tickets t
      JOIN usuarios u ON t.usuario_id = u.id
      WHERE t.tecnico_id = $1
      AND t.problema_id IS NULL  -- Excluir tickets con un problema_id asignado
      ORDER BY t.fecha_creacion DESC
    `, [tecnico_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay tickets asignados para este técnico.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tickets asignados:', error);
    res.status(500).json({ error: 'Error al obtener los tickets asignados.' });
  }
});

  

// Endpoint para obtener los detalles de un ticket específico
app.get('/api/DetallesTickets/:id', async (req, res) => {
    const ticketId = req.params.id;
  
    try {
      // Obtener detalles del ticket
      const ticketResult = await pool.query(`
        SELECT t.id, t.descripcion, t.estado, t.prioridad, t.fecha_creacion, t.fecha_cierre,
               u.nombre AS cliente, u.username AS cliente_username, td.nombre AS tema,
               d.nombre AS departamento, t.tecnico_id, t.usuario_id
        FROM tickets t
        JOIN usuarios u ON t.usuario_id = u.id  -- Usuario que creó el ticket
        JOIN temas_departamento td ON t.tema_id = td.id  -- Tema del ticket
        JOIN departamentos d ON t.departamento_id = d.id  -- Departamento asignado
        WHERE t.id = $1
      `, [ticketId]);
  
      if (ticketResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }
  
      // Obtener historial de cambios del ticket
      const historialResult = await pool.query(`
        SELECT h.cambio, h.fecha, u.nombre AS tecnico
        FROM historial_tickets h
        JOIN usuarios u ON h.tecnico_id = u.id  -- Técnico que realizó el cambio
        WHERE h.ticket_id = $1
        ORDER BY h.fecha ASC
      `, [ticketId]);
  
      // Obtener información del técnico asignado
      const tecnicoResult = await pool.query(`
        SELECT nombre, username FROM usuarios WHERE id = $1
      `, [ticketResult.rows[0].tecnico_id]);
  
      const ticket = ticketResult.rows[0];
      const historial = historialResult.rows;
      const tecnico = tecnicoResult.rows[0];
  
      res.json({
        ticket,
        historial,
        tecnico
      });
    } catch (error) {
      console.error('Error al obtener los detalles del ticket:', error);
      res.status(500).json({ error: 'Error al obtener los detalles del ticket.' });
    }
  });
  
  



// 1. API para actualizar estado y prioridad del ticket
app.put('/api/tickets/:id/actualizar', async (req, res) => {
  const { estado, prioridad, tecnico_id } = req.body;
  const ticketId = req.params.id;

  try {
    // Iniciar transacción
    await pool.query('BEGIN');

    // Actualizar el ticket
    const updateResult = await pool.query(
      `UPDATE tickets 
       SET estado = $1, prioridad = $2
       WHERE id = $3
       RETURNING *`,
      [estado, prioridad, ticketId]
    );

    // Registrar en el historial
    await pool.query(
      `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio)
       VALUES ($1, $2, $3)`,
      [
        ticketId,
        tecnico_id,
        `Actualizó el ticket - Estado: ${estado}, Prioridad: ${prioridad}`
      ]
    );

    await pool.query('COMMIT');
    res.json({ ticket: updateResult.rows[0] });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});


// 2. API para agregar respuesta al ticket
app.post('/api/tickets/:id/responder', async (req, res) => {
  const { respuesta, tecnico_id } = req.body;
  const ticketId = req.params.id;

  try {
    // Iniciar transacción
    await pool.query('BEGIN');

    // Registrar la respuesta en el historial
    const historialResult = await pool.query(
      `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticketId, tecnico_id, respuesta]
    );

    await pool.query('COMMIT');
    res.json({ historial: historialResult.rows[0] });

  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// 3. API para obtener detalles completos del ticket
app.get('/api/tickets/:id/detalles', async (req, res) => {
  try {
    // Obtener información del ticket
    const ticketResult = await pool.query(
      `SELECT t.*, 
              u_creador.nombre as usuario_nombre,
              u_tecnico.nombre as tecnico_nombre,
              d.nombre as departamento_nombre,
              td.nombre as tema_nombre
       FROM tickets t
       LEFT JOIN usuarios u_creador ON t.usuario_id = u_creador.id
       LEFT JOIN usuarios u_tecnico ON t.tecnico_id = u_tecnico.id
       LEFT JOIN departamentos d ON t.departamento_id = d.id
       LEFT JOIN temas_departamento td ON t.tema_id = td.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    res.json({ ticket: ticketResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

















//APIS ADMINISTRADOR

// APIs simplificadas para el Panel Administrativo

// 1. Obtener todos los tickets
app.get('/api/admin/TodosLosTickets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        json_build_object(
          'id', u_creador.id,
          'nombre', u_creador.nombre
        ) as usuario,
        json_build_object(
          'id', u_tecnico.id,
          'nombre', u_tecnico.nombre
        ) as tecnico,
        json_build_object(
          'id', d.id,
          'nombre', d.nombre
        ) as departamento,
        json_build_object(
          'id', td.id,
          'nombre', td.nombre
        ) as tema
      FROM tickets t
      JOIN usuarios u_creador ON t.usuario_id = u_creador.id
      LEFT JOIN usuarios u_tecnico ON t.tecnico_id = u_tecnico.id
      JOIN departamentos d ON t.departamento_id = d.id
      JOIN temas_departamento td ON t.tema_id = td.id
      ORDER BY t.fecha_creacion DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Los demás endpoints se mantienen igual
app.get('/api/admin/ListaDepartamentos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre FROM departamentos ORDER BY nombre ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/admin/DetallesTicket/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.descripcion,
        t.prioridad,
        t.estado,
        t.fecha_creacion,
        t.fecha_cierre,
        json_build_object(
          'id', u_creador.id,
          'nombre', u_creador.nombre
        ) as usuario,
        COALESCE(json_build_object(
          'id', u_tecnico.id,
          'nombre', u_tecnico.nombre
        ), NULL) as tecnico,
        json_build_object(
          'id', d.id,
          'nombre', d.nombre
        ) as departamento,
        json_build_object(
          'id', td.id,
          'nombre', td.nombre
        ) as tema
      FROM tickets t
      JOIN usuarios u_creador ON t.usuario_id = u_creador.id
      LEFT JOIN usuarios u_tecnico ON t.tecnico_id = u_tecnico.id
      JOIN departamentos d ON t.departamento_id = d.id
      JOIN temas_departamento td ON t.tema_id = td.id
      WHERE t.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalles del ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/admin/HistorialTicket/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        h.id,
        h.cambio,
        h.fecha,
        COALESCE(json_build_object(
          'id', u.id,
          'nombre', u.nombre
        ), NULL) as tecnico
      FROM historial_tickets h
      LEFT JOIN usuarios u ON h.tecnico_id = u.id
      WHERE h.ticket_id = $1
      ORDER BY h.fecha DESC
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No hay historial para este ticket' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial del ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});















//APIS USUARIOS:
// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, d.nombre as departamento_nombre 
      FROM usuarios u 
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      WHERE u.tipo != 'administrador'
      ORDER BY u.nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear usuario
app.post('/api/CrearUsuarios', async (req, res) => {
  const { username, password, nombre, tipo, departamento_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (username, password, nombre, tipo, departamento_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, nombre, tipo, departamento_id`,
      [username, password, nombre, tipo, departamento_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.constraint === 'usuarios_username_key') {
      res.status(400).json({ error: 'El nombre de usuario ya existe' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Actualizar usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, nombre, tipo, departamento_id } = req.body;
  try {
    const query = `
      UPDATE usuarios 
      SET username = $1, password = $2, nombre = $3, tipo = $4, departamento_id = $5
      WHERE id = $6 
      RETURNING id, username, nombre, tipo, departamento_id
    `;
    const params = [username, password, nombre, tipo, departamento_id, id];
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});





//API PROBLEMAS:

app.post('/api/problemas', async (req, res) => {
  try {
    const { titulo, descripcion, ticketsRelacionados } = req.body;
    
    // Llamar a la función que maneja toda la lógica
    const result = await pool.query(
      'SELECT crear_problema_y_actualizar_tickets($1, $2, $3) as problema_id',
      [titulo, descripcion, ticketsRelacionados]
    );
    
    const problemaId = result.rows[0].problema_id;
    
    res.json({
      success: true,
      mensaje: 'Problema creado exitosamente',
      problemaId: problemaId
    });
    
  } catch (error) {
    console.error('Error al crear problema:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear el problema',
      error: error.message
    });
  }
});


app.get('/api/problemas', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id, 
        p.titulo, 
        p.estado, 
        p.fecha_creacion, 
        u.nombre as tecnico_nombre
      FROM problemas p
      LEFT JOIN usuarios u ON p.tecnico_asignado = u.id
      ORDER BY p.fecha_creacion DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/problemas/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener detalles del problema
    const problemaResult = await pool.query(`
      SELECT 
        p.*, 
        u.nombre as tecnico_nombre
      FROM problemas p
      LEFT JOIN usuarios u ON p.tecnico_asignado = u.id
      WHERE p.id = $1
    `, [id]);

    // Obtener tickets relacionados
    const ticketsResult = await pool.query(`
      SELECT 
        id, 
        descripcion, 
        estado 
      FROM tickets 
      WHERE problema_id = $1
    `, [id]);

    const problema = problemaResult.rows[0];
    problema.tickets = ticketsResult.rows;

    res.json(problema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});









app.post('/api/problemas/:id/resolver', async (req, res) => {
  const { id } = req.params;
  const { solucion, tecnicoId } = req.body;

  // Convertir tecnicoId a número si es necesario
  const tecnicoIdNumerico = typeof tecnicoId === 'string' 
    ? parseInt(tecnicoId, 10) 
    : tecnicoId;

  // Validar que tecnicoId sea un número válido
  if (isNaN(tecnicoIdNumerico)) {
    return res.status(400).json({
      success: false,
      mensaje: 'tecnicoId debe ser un número válido'
    });
  }

  // Validación de datos requeridos
  if (!id || !solucion || !tecnicoIdNumerico) {
    return res.status(400).json({
      success: false,
      mensaje: 'Faltan datos requeridos: id, solucion y tecnicoId son obligatorios'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Depurar los valores recibidos
    console.log('Valores recibidos:', { id, solucion, tecnicoIdNumerico });

    // Verificar que el problema exista y no esté ya resuelto
    const problemaExistente = await client.query(`
      SELECT estado 
      FROM problemas 
      WHERE id = CAST($1 AS INTEGER) AND estado != 'Resuelto'
    `, [id]);

    if (problemaExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        mensaje: 'Problema no encontrado o ya está resuelto'
      });
    }

    // Verificar que el técnico exista
    const tecnicoExistente = await client.query(`
      SELECT id 
      FROM usuarios 
      WHERE id = CAST($1 AS INTEGER) AND tipo IN ('tecnico', 'administrador')
    `, [tecnicoIdNumerico]);

    if (tecnicoExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        mensaje: 'Técnico no válido'
      });
    }

    // Actualizar problema como resuelto
    await client.query(`
      UPDATE problemas 
      SET 
        estado = 'Resuelto', 
        solucion = $1
      WHERE id = CAST($2 AS INTEGER)
    `, [solucion, id]);

    // Actualizar todos los tickets relacionados a resueltos
    const ticketsAfectados = await client.query(`
      UPDATE tickets 
      SET 
        estado = 'resuelto',
        fecha_cierre = CURRENT_TIMESTAMP
      WHERE problema_id = CAST($1 AS INTEGER)
      RETURNING id
    `, [id]);

    // Insertar en historial de tickets solo para los tickets afectados
    if (ticketsAfectados.rows.length > 0) {
      await client.query(`
        INSERT INTO historial_tickets 
          (ticket_id, tecnico_id, cambio, fecha) 
        SELECT 
          id, 
          CAST($1 AS INTEGER), 
          'Ticket resuelto como parte del problema #' || CAST($2 AS INTEGER) || ': ' || $3, 
          CURRENT_TIMESTAMP 
        FROM tickets 
        WHERE problema_id = CAST($2 AS INTEGER)
      `, [tecnicoIdNumerico, id, solucion]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      mensaje: 'Problema resuelto exitosamente',
      ticketsResueltos: ticketsAfectados.rows.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al resolver problema:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al resolver el problema',
      error: error.message
    });
  } finally {
    client.release();
  }
});
















// Iniciar el servidor

// Puerto en el que escuchará el servidor
app.listen(3000, () => {
    console.log("Servidor backend corriendo en :3000");
  });
  