const Evento = require('../models/Evento');

// @desc    Obtener reporte de métricas globales y porcentaje de ocupación por evento
// @route   GET /api/reportes/aforo
// @access  Público / Coordinadores
exports.getReporteAforo = async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ fechaHora: 1 });

    let capacidadTotal = 0;
    let totalInscritosGlobal = 0;
    let eventosAgotados = 0;
    let eventosConCupo = 0;

    const reporteEventos = eventos.map((ev) => {
      const cuposDisponibles = Math.max(0, ev.cupoMaximo - ev.totalInscritos);
      const porcentaje = ev.cupoMaximo > 0
        ? Number(((ev.totalInscritos / ev.cupoMaximo) * 100).toFixed(1))
        : 0;

      capacidadTotal += ev.cupoMaximo;
      totalInscritosGlobal += ev.totalInscritos;

      let estado = 'Disponible';
      if (cuposDisponibles === 0) {
        estado = 'Agotado';
        eventosAgotados += 1;
      } else if (porcentaje >= 80) {
        estado = 'Casi Lleno';
        eventosConCupo += 1;
      } else {
        eventosConCupo += 1;
      }

      return {
        _id: ev._id,
        titulo: ev.titulo,
        ponente: ev.ponente,
        auditorio: ev.auditorio,
        fechaHora: ev.fechaHora,
        cupoMaximo: ev.cupoMaximo,
        totalInscritos: ev.totalInscritos,
        cuposDisponibles,
        porcentajeOcupacion: porcentaje,
        estado
      };
    });

    const porcentajeOcupacionGlobal = capacidadTotal > 0
      ? Number(((totalInscritosGlobal / capacidadTotal) * 100).toFixed(1))
      : 0;

    const metricasGlobales = {
      totalEventos: eventos.length,
      capacidadTotal,
      totalInscritosGlobal,
      cuposDisponiblesGlobal: Math.max(0, capacidadTotal - totalInscritosGlobal),
      porcentajeOcupacionGlobal,
      eventosAgotados,
      eventosConCupo
    };

    res.status(200).json({
      success: true,
      fechaGeneracion: new Date(),
      metricasGlobales,
      eventos: reporteEventos
    });
  } catch (error) {
    console.error('Error en getReporteAforo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de aforo',
      error: error.message
    });
  }
};

