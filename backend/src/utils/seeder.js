const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Evento = require('../models/Evento');
const Inscripcion = require('../models/Inscripcion');

dotenv.config();

const eventosEjemplo = [
  {
    titulo: 'Simposio Internacional de Inteligencia Artificial Generativa y LLMs',
    ponente: 'Dra. Elena Rostova (Investigadora Senior en Deep Learning)',
    auditorio: 'Paraninfo Central - Edificio de Rectoría',
    fechaHora: new Date(Date.now() + 86400000 * 2), // en 2 días
    cupoMaximo: 25,
    totalInscritos: 0
  },
  {
    titulo: 'Workshop Práctico: Arquitectura Cloud Native y Kubernetes',
    ponente: 'Ing. Carlos Mendoza (Cloud Solutions Architect)',
    auditorio: 'Laboratorio de Cómputo Especializado 4B',
    fechaHora: new Date(Date.now() + 86400000 * 4), // en 4 días
    cupoMaximo: 5, // Evento pequeño para probar aforo completo
    totalInscritos: 0
  },
  {
    titulo: 'Seminario de Ciberseguridad Ofensiva, Hacking Ético y Forense',
    ponente: 'Mag. Andrea Morales (Especialista en Threat Intelligence)',
    auditorio: 'Aula Magna de Ingeniería de Sistemas',
    fechaHora: new Date(Date.now() + 86400000 * 6), // en 6 días
    cupoMaximo: 30,
    totalInscritos: 0
  },
  {
    titulo: 'Conferencia: Desarrollo Web Moderno con React y Microfrontends',
    ponente: 'Lic. Mateo Gómez (Staff Frontend Engineer)',
    auditorio: 'Auditorio 2 - Bloque de Tecnologías',
    fechaHora: new Date(Date.now() + 86400000 * 8), // en 8 días
    cupoMaximo: 10,
    totalInscritos: 0
  },
  {
    titulo: 'Mesa Redonda: Ética y Regulación de Algoritmos Autónomos',
    ponente: 'Dr. Fernando Silva (Doctor en Filosofía de la Ciencia y Tecnología)',
    auditorio: 'Auditorio de Posgrados y Humanidades',
    fechaHora: new Date(Date.now() + 86400000 * 12), // en 12 días
    cupoMaximo: 40,
    totalInscritos: 0
  }
];

const sembrarDatos = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unievents';
    console.log(`Conectando a MongoDB en: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Limpiando colecciones anteriores...');
    await Evento.deleteMany();
    await Inscripcion.deleteMany();

    console.log('Insertando eventos de prueba...');
    const eventosCreados = await Evento.insertMany(eventosEjemplo);
    console.log(`[OK] ${eventosCreados.length} eventos creados.`);

    // Crear inscripciones de prueba para llenar algunos cupos
    console.log('Creando inscripciones de prueba...');
    
    // Llenar completamente el evento 2 (Workshop Cloud Native con cupoMaximo: 5)
    const evento2 = eventosCreados[1];
    const estudiantesEvento2 = [
      { nombre: 'Laura Valentina Pérez', correo: 'laura.perez@universidad.edu.co', carrera: 'Ingeniería de Sistemas' },
      { nombre: 'Juan David Ramírez', correo: 'juan.ramirez@universidad.edu.co', carrera: 'Ingeniería de Software' },
      { nombre: 'Sofía Castro Morales', correo: 'sofia.castro@universidad.edu.co', carrera: 'Ingeniería de Sistemas' },
      { nombre: 'Andrés Felipe Mejía', correo: 'andres.mejia@universidad.edu.co', carrera: 'Ciencia de Datos' },
      { nombre: 'Camila Torres Vega', correo: 'camila.torres@universidad.edu.co', carrera: 'Ingeniería Electrónica' }
    ];

    for (const est of estudiantesEvento2) {
      await Inscripcion.create({
        eventoId: evento2._id,
        nombreEstudiante: est.nombre,
        correo: est.correo,
        carrera: est.carrera
      });
    }
    evento2.totalInscritos = 5;
    await evento2.save();

    // Llenar parcialmente el evento 1 (Simposio IA con cupoMaximo: 25, ocupando 12)
    const evento1 = eventosCreados[0];
    const estudiantesEvento1 = [
      { nombre: 'Mateo Restrepo', correo: 'mateo.restrepo@universidad.edu.co', carrera: 'Ingeniería de Software' },
      { nombre: 'Daniela Ospina', correo: 'daniela.ospina@universidad.edu.co', carrera: 'Ingeniería de Sistemas' },
      { nombre: 'Santiago Vargas', correo: 'santiago.vargas@universidad.edu.co', carrera: 'Ingeniería Industrial' },
      { nombre: 'Valentina Rios', correo: 'valentina.rios@universidad.edu.co', carrera: 'Ciencia de Datos' }
    ];

    for (const est of estudiantesEvento1) {
      await Inscripcion.create({
        eventoId: evento1._id,
        nombreEstudiante: est.nombre,
        correo: est.correo,
        carrera: est.carrera
      });
    }
    evento1.totalInscritos = estudiantesEvento1.length;
    await evento1.save();

    // Llenar casi por completo el evento 4 (cupo 10, inscritos 8)
    const evento4 = eventosCreados[3];
    for (let i = 1; i <= 8; i++) {
      await Inscripcion.create({
        eventoId: evento4._id,
        nombreEstudiante: `Estudiante Prueba ${i}`,
        correo: `estudiante.${i}@universidad.edu.co`,
        carrera: 'Ingeniería de Software'
      });
    }
    evento4.totalInscritos = 8;
    await evento4.save();

    console.log('[ÉXITO] Base de datos sembrada correctamente con datos de prueba.');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR al sembrar datos]:', error);
    process.exit(1);
  }
};

sembrarDatos();

