const mongoose = require('mongoose');
const Evento = require('../models/Evento');
const Inscripcion = require('../models/Inscripcion');

// @desc    Procesar inscripción de estudiante con verificación atómica de aforo
// @route   POST /api/inscripciones
// @access  Público
exports.createInscripcion = async (req, res) => {
  try {
    const { eventoId, nombreEstudiante, correo, carrera } = req.body;

    // 1. Validaciones básicas de entrada
    if (!eventoId || !nombreEstudiante || !correo || !carrera) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios (eventoId, nombreEstudiante, correo, carrera)'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventoId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del evento no es un identificador válido'
      });
    }

    const emailNormalizado = correo.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailNormalizado)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo institucional es inválido'
      });
    }

    // 2. Comprobar si el evento existe
    const eventoExistente = await Evento.findById(eventoId);
    if (!eventoExistente) {
      return res.status(404).json({
        success: false,
        message: 'El evento especificado no existe'
      });
    }

    // 3. Control Atómico de Aforo (RNF-03 y Sección 6 de la especificación técnica)
    // Se ejecuta una actualización condicional directa en MongoDB
    const eventoActualizado = await Evento.findOneAndUpdate(
      {
        _id: eventoId,
        $expr: { $lt: ["$totalInscritos", "$cupoMaximo"] }
      },
      { $inc: { totalInscritos: 1 } },
      { new: true }
    );

    // Resultado B: Si eventoActualizado es null, el aforo se completó justo antes de esta petición
    if (!eventoActualizado) {
      return res.status(400).json({
        success: false,
        message: 'Aforo Agotado',
        error: 'AFORO_AGOTADO',
        cuposDisponibles: 0
      });
    }

    // Resultado A: El cupo quedó reservado atómicamente; se procede a crear la inscripción
    try {
      const nuevaInscripcion = await Inscripcion.create({
        eventoId,
        nombreEstudiante: nombreEstudiante.trim(),
        correo: emailNormalizado,
        carrera: carrera.trim()
      });

      const cuposRestantes = Math.max(0, eventoActualizado.cupoMaximo - eventoActualizado.totalInscritos);

      return res.status(201).json({
        success: true,
        message: 'Inscripción realizada exitosamente',
        inscripcion: nuevaInscripcion,
        evento: {
          _id: eventoActualizado._id,
          titulo: eventoActualizado.titulo,
          totalInscritos: eventoActualizado.totalInscritos,
          cupoMaximo: eventoActualizado.cupoMaximo,
          cuposDisponibles: cuposRestantes
        }
      });
    } catch (insertError) {
      // Revertir atómicamente el cupo reservado en caso de fallo durante el guardado
      await Evento.findByIdAndUpdate(eventoId, { $inc: { totalInscritos: -1 } });

      // RF-04: Restricción de duplicados por índice único compuesto { eventoId: 1, correo: 1 }
      if (insertError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'El estudiante con este correo ya se encuentra registrado en este evento',
          error: 'DUPLICATE_REGISTRATION'
        });
      }

      throw insertError;
    }
  } catch (error) {
    console.error('Error en createInscripcion:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar la inscripción',
      error: error.message
    });
  }
};

// @desc    Obtener inscripciones de un evento específico
// @route   GET /api/inscripciones/evento/:eventoId
// @access  Coordinadores / Público
exports.getInscripcionesByEvento = async (req, res) => {
  try {
    const { eventoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de evento inválido'
      });
    }

    const inscripciones = await Inscripcion.find({ eventoId }).sort({ fechaRegistro: -1 });

    res.status(200).json({
      success: true,
      total: inscripciones.length,
      inscripciones
    });
  } catch (error) {
    console.error('Error en getInscripcionesByEvento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las inscripciones del evento',
      error: error.message
    });
  }
};

