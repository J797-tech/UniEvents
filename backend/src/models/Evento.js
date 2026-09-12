const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    ponente: {
      type: String,
      required: [true, 'El nombre del ponente es obligatorio'],
      trim: true,
      maxlength: [120, 'El nombre del ponente no puede exceder 120 caracteres']
    },
    auditorio: {
      type: String,
      required: [true, 'El auditorio o recinto es obligatorio'],
      trim: true,
      maxlength: [120, 'El auditorio no puede exceder 120 caracteres']
    },
    fechaHora: {
      type: Date,
      required: [true, 'La fecha y hora del evento es obligatoria']
    },
    cupoMaximo: {
      type: Number,
      required: [true, 'El cupo máximo es obligatorio'],
      min: [1, 'El cupo máximo debe ser mayor a 0'],
      validate: {
        validator: Number.isInteger,
        message: 'El cupo máximo debe ser un número entero'
      }
    },
    totalInscritos: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'El total de inscritos no puede ser negativo']
    },
    creadoEn: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Propiedad virtual para calcular cupos disponibles en tiempo de serialización
EventoSchema.virtual('cuposDisponibles').get(function () {
  return Math.max(0, this.cupoMaximo - this.totalInscritos);
});

// Propiedad virtual para calcular porcentaje de ocupación
EventoSchema.virtual('porcentajeOcupacion').get(function () {
  if (!this.cupoMaximo || this.cupoMaximo === 0) return 0;
  return Number(((this.totalInscritos / this.cupoMaximo) * 100).toFixed(1));
});

module.exports = mongoose.model('Evento', EventoSchema);

