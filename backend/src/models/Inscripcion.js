const mongoose = require('mongoose');

const InscripcionSchema = new mongoose.Schema({
  eventoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: [true, 'El ID del evento es obligatorio']
  },
  nombreEstudiante: {
    type: String,
    required: [true, 'El nombre del estudiante es obligatorio'],
    trim: true,
    maxlength: [120, 'El nombre no puede exceder 120 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo institucional es obligatorio'],
    trim: true,
    lowercase: true,
    match: [
      /^\S+@\S+\.\S+$/,
      'Por favor ingrese un correo electrónico válido'
    ]
  },
  carrera: {
    type: String,
    required: [true, 'El programa académico o carrera es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre de la carrera no puede exceder 100 caracteres']
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Índice Único Compuesto (RF-04): Evita que un mismo estudiante se registre más de una vez en el mismo evento
InscripcionSchema.index({ eventoId: 1, correo: 1 }, { unique: true });

module.exports = mongoose.model('Inscripcion', InscripcionSchema);

