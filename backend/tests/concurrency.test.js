const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Evento = require('../src/models/Evento');
const Inscripcion = require('../src/models/Inscripcion');
const { createInscripcion } = require('../src/controllers/inscripcionController');

dotenv.config();

/**
 * Mock de respuesta Express para simular ejecución de controlador
 */
function mockResponse() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.body = data;
    return res;
  };
  return res;
}

async function runConcurrencyTest() {
  console.log('========================================================');
  console.log('🧪 [TEST DE CONCURRENCIA Y ATOMICIDAD EN MONGODB]');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unievents';
  await mongoose.connect(mongoUri);

  try {
    // 1. Limpiar datos de prueba anteriores
    await Evento.deleteMany({ titulo: { $regex: /TEST_CONCURRENCY/i } });
    await Inscripcion.deleteMany({ carrera: 'Test Engineering' });

    // 2. Crear un evento con cupo muy limitado (Capacidad = 5)
    const cupoMaximo = 5;
    const eventoTest = await Evento.create({
      titulo: 'TEST_CONCURRENCY: Masterclass de Algoritmos Paralelos',
      ponente: 'Dr. Concurrency Tester',
      auditorio: 'Sala de Pruebas Automatizadas',
      fechaHora: new Date(Date.now() + 86400000),
      cupoMaximo: cupoMaximo,
      totalInscritos: 0
    });

    console.log(`📌 Evento de prueba creado: "${eventoTest.titulo}"`);
    console.log(`   Capacidad Máxima establecida: ${cupoMaximo} cupos.`);
    console.log(`   Inscritos Iniciales: ${eventoTest.totalInscritos}\n`);

    // 3. Simular una ráfaga concurrente de 20 peticiones simultáneas
    const totalPeticiones = 20;
    console.log(`⚡ Disparando ráfaga simultánea de ${totalPeticiones} solicitudes de inscripción...`);

    const peticiones = [];
    for (let i = 1; i <= totalPeticiones; i++) {
      const req = {
        body: {
          eventoId: eventoTest._id.toString(),
          nombreEstudiante: `Estudiante Concurrente ${i}`,
          correo: `estudiante.concurrente.${i}@universidad.edu.co`,
          carrera: 'Test Engineering'
        }
      };
      const res = mockResponse();

      peticiones.push(
        createInscripcion(req, res).then(() => ({
          solicitudId: i,
          status: res.statusCode,
          body: res.body
        }))
      );
    }

    // Esperar a que todas las peticiones concurrentes finalicen
    const resultados = await Promise.all(peticiones);

    const exitosas = resultados.filter(r => r.status === 201);
    const rechazadasAforo = resultados.filter(r => r.status === 400 && r.body?.message === 'Aforo Agotado');
    const otrosErrores = resultados.filter(r => r.status !== 201 && (r.status !== 400 || r.body?.message !== 'Aforo Agotado'));

    console.log('\n📊 RESULTADOS DE LA RÁFAGA CONCURRENTE:');
    console.log(`   ✅ Inscripciones Exitosas (201 Created): ${exitosas.length}`);
    console.log(`   ⛔ Rechazadas por Aforo Agotado (400 Bad Request): ${rechazadasAforo.length}`);
    console.log(`   ⚠️ Otros Errores inesperados: ${otrosErrores.length}`);

    // 4. Verificar el estado final en la base de datos
    const eventoFinal = await Evento.findById(eventoTest._id);
    const totalInscripcionesBD = await Inscripcion.countDocuments({ eventoId: eventoTest._id });

    console.log('\n🔍 VERIFICACIÓN DE INTEGRIDAD EN BASE DE DATOS:');
    console.log(`   - totalInscritos en documento Evento: ${eventoFinal.totalInscritos} (Esperado: ${cupoMaximo})`);
    console.log(`   - Total de documentos en colección Inscripciones: ${totalInscripcionesBD} (Esperado: ${cupoMaximo})`);
    console.log(`   - Cupos disponibles calculados: ${Math.max(0, eventoFinal.cupoMaximo - eventoFinal.totalInscritos)} (Esperado: 0)`);

    let passed = true;

    if (exitosas.length !== cupoMaximo) {
      console.error(`❌ FALLO: Se esperaban exactamente ${cupoMaximo} inscripciones exitosas, pero se obtuvieron ${exitosas.length}.`);
      passed = false;
    }

    if (rechazadasAforo.length !== (totalPeticiones - cupoMaximo)) {
      console.error(`❌ FALLO: Se esperaban ${totalPeticiones - cupoMaximo} rechazos por aforo, pero se obtuvieron ${rechazadasAforo.length}.`);
      passed = false;
    }

    if (eventoFinal.totalInscritos > cupoMaximo || totalInscripcionesBD > cupoMaximo) {
      console.error(`❌ FALLO CRÍTICO: ¡SOBREVENTA DETECTADA! (Race Condition no controlada)`);
      passed = false;
    }

    // 5. Probar restricción de duplicados (RF-04)
    console.log('\n🧪 [TEST DE RESTRICCIÓN DE DUPLICADOS - RF-04]');
    const eventoDuplicado = await Evento.create({
      titulo: 'TEST_DUPLICATE: Taller de Pruebas Unitarias',
      ponente: 'Prof. Tester',
      auditorio: 'Lab 1',
      fechaHora: new Date(Date.now() + 86400000),
      cupoMaximo: 10,
      totalInscritos: 0
    });

    const correoPrueba = 'alumno.repetido@universidad.edu.co';
    const req1 = { body: { eventoId: eventoDuplicado._id.toString(), nombreEstudiante: 'Alumno Repetido', correo: correoPrueba, carrera: 'Ingeniería' } };
    const res1 = mockResponse();
    await createInscripcion(req1, res1);

    const req2 = { body: { eventoId: eventoDuplicado._id.toString(), nombreEstudiante: 'Alumno Repetido', correo: correoPrueba, carrera: 'Ingeniería' } };
    const res2 = mockResponse();
    await createInscripcion(req2, res2);

    const evDupFinal = await Evento.findById(eventoDuplicado._id);

    console.log(`   - Primer intento: HTTP ${res1.statusCode} (${res1.body?.message})`);
    console.log(`   - Segundo intento duplicado: HTTP ${res2.statusCode} (${res2.body?.message})`);
    console.log(`   - Total inscritos en evento tras intento duplicado: ${evDupFinal.totalInscritos} (Esperado: 1)`);

    if (res1.statusCode === 201 && res2.statusCode === 409 && evDupFinal.totalInscritos === 1) {
      console.log('   ✅ Restricción de duplicados verificada con éxito (Rollback atómico funciona).');
    } else {
      console.error('   ❌ Fallo en la verificación de duplicados.');
      passed = false;
    }

    // Limpieza de datos de prueba
    await Evento.deleteMany({ titulo: { $regex: /TEST_/i } });
    await Inscripcion.deleteMany({ carrera: { $in: ['Test Engineering', 'Ingeniería'] } });

    console.log('\n========================================================');
    if (passed) {
      console.log('🎉 ¡TODAS LAS PRUEBAS DE CONCURRENCIA Y ATOMICIDAD PASARON!');
    } else {
      console.log('❌ ALGUNAS PRUEBAS FALLARON');
      process.exit(1);
    }
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del test:', error);
    process.exit(1);
  }
}

runConcurrencyTest();

