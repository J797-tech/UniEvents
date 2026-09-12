const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos MongoDB
connectDB();

const app = express();

// Middlewares globales
app.use(cors({
  origin: '*', // Permitir peticiones desde cualquier origen en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger básico de peticiones en consola
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Endpoint raíz de verificación
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'UniEvents API',
    version: '1.0.0',
    description: 'API REST para Gestión de Eventos Académicos y Control de Aforo',
    status: 'ONLINE',
    endpoints: {
      eventos: '/api/eventos',
      inscripciones: '/api/inscripciones',
      reportes: '/api/reportes/aforo'
    }
  });
});

// Rutas de la API REST
app.use('/api/eventos', require('./routes/eventoRoutes'));
app.use('/api/inscripciones', require('./routes/inscripcionRoutes'));
app.use('/api/reportes', require('./routes/reporteRoutes'));

// Endpoint auxiliar para resembrar datos de prueba rápidamente
app.post('/api/seed', async (req, res) => {
  try {
    const Evento = require('./models/Evento');
    const Inscripcion = require('./models/Inscripcion');
    
    await Evento.deleteMany();
    await Inscripcion.deleteMany();

    const eventosCreados = await Evento.insertMany([
      {
        titulo: 'Simposio Internacional de Inteligencia Artificial Generativa y LLMs',
        ponente: 'Dra. Elena Rostova (Investigadora Senior en Deep Learning)',
        auditorio: 'Paraninfo Central - Edificio de Rectoría',
        fechaHora: new Date(Date.now() + 86400000 * 2),
        cupoMaximo: 25,
        totalInscritos: 4
      },
      {
        titulo: 'Workshop Práctico: Arquitectura Cloud Native y Kubernetes',
        ponente: 'Ing. Carlos Mendoza (Cloud Solutions Architect)',
        auditorio: 'Laboratorio de Cómputo Especializado 4B',
        fechaHora: new Date(Date.now() + 86400000 * 4),
        cupoMaximo: 5,
        totalInscritos: 5 // Agotado
      },
      {
        titulo: 'Seminario de Ciberseguridad Ofensiva, Hacking Ético y Forense',
        ponente: 'Mag. Andrea Morales (Especialista en Threat Intelligence)',
        auditorio: 'Aula Magna de Ingeniería de Sistemas',
        fechaHora: new Date(Date.now() + 86400000 * 6),
        cupoMaximo: 30,
        totalInscritos: 1
      },
      {
        titulo: 'Conferencia: Desarrollo Web Moderno con React y Microfrontends',
        ponente: 'Lic. Mateo Gómez (Staff Frontend Engineer)',
        auditorio: 'Auditorio 2 - Bloque de Tecnologías',
        fechaHora: new Date(Date.now() + 86400000 * 8),
        cupoMaximo: 10,
        totalInscritos: 8
      },
      {
        titulo: 'Mesa Redonda: Ética y Regulación de Algoritmos Autónomos',
        ponente: 'Dr. Fernando Silva (Doctor en Filosofía de la Ciencia y Tecnología)',
        auditorio: 'Auditorio de Posgrados y Humanidades',
        fechaHora: new Date(Date.now() + 86400000 * 12),
        cupoMaximo: 40,
        totalInscritos: 0
      }
    ]);

    // Crear inscripciones para el evento 2 (Agotado)
    for (let i = 1; i <= 5; i++) {
      await Inscripcion.create({
        eventoId: eventosCreados[1]._id,
        nombreEstudiante: `Estudiante Taller ${i}`,
        correo: `estudiante.taller${i}@universidad.edu.co`,
        carrera: 'Ingeniería de Sistemas'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Base de datos reinicializada con datos de prueba con éxito',
      totalEventos: eventosCreados.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada en el servidor`
  });
});

// Manejador global de errores (500)
app.use((err, req, res, next) => {
  console.error('[Error no controlado]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[UniEvents Server] Servidor backend ejecutándose en el puerto ${PORT}`);
  console.log(`[UniEvents Server] Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };

