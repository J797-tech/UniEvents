const Evento = require('../models/Evento');

// @desc    Obtener todos los eventos con cupos disponibles calculados
// @route   GET /api/eventos
// @access  Público
exports.getEventos = async (req, res) => {
  try {
    const { busqueda, estado } = req.query;
    let query = {};

    if (busqueda && busqueda.trim() !== '') {
      const regex = new RegExp(busqueda.trim(), 'i');
      query.$or = [
        { titulo: regex },
        { ponente: regex },
        { auditorio: regex }
      ];
    }

    const eventos = await Evento.find(query).sort({ fechaHora: 1 });

    const eventosFormateados = eventos.map((ev) => {
      const plain = ev.toJSON();
      const cuposDisponibles = Math.max(0, ev.cupoMaximo - ev.totalInscritos);
      const porcentajeOcupacion = ev.cupoMaximo > 0 ? Number(((ev.totalInscritos / ev.cupoMaximo) * 100).toFixed(1)) : 0;
      const estaAgotado = cuposDisponibles <= 0;

      return {
        ...plain,
        cuposDisponibles,
        porcentajeOcupacion,
        estaAgotado
      };
    });

    // Filtro por estado si se solicitó en query
    let resultado = eventosFormateados;
    if (estado === 'disponibles') {
      resultado = eventosFormateados.filter(e => !e.estaAgotado);
    } else if (estado === 'agotados') {
      resultado = eventosFormateados.filter(e => e.estaAgotado);
    }

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getEventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de eventos',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo evento
// @route   POST /api/eventos
// @access  Coordinadores / Público
exports.createEvento = async (req, res) => {
  try {
    const { titulo, ponente, auditorio, fechaHora, cupoMaximo } = req.body;

    // Validaciones básicas
    if (!titulo || !ponente || !auditorio || !fechaHora || cupoMaximo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios (titulo, ponente, auditorio, fechaHora, cupoMaximo)'
      });
    }

    const parsedCupo = parseInt(cupoMaximo, 10);
    if (isNaN(parsedCupo) || parsedCupo <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El cupo máximo debe ser un número entero mayor a 0'
      });
    }

    const fechaEvento = new Date(fechaHora);
    if (isNaN(fechaEvento.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'La fecha y hora proporcionada no es válida'
      });
    }

    const nuevoEvento = await Evento.create({
      titulo: titulo.trim(),
      ponente: ponente.trim(),
      auditorio: auditorio.trim(),
      fechaHora: fechaEvento,
      cupoMaximo: parsedCupo,
      totalInscritos: 0
    });

    const eventoResponse = nuevoEvento.toJSON();
    eventoResponse.cuposDisponibles = parsedCupo;
    eventoResponse.porcentajeOcupacion = 0;
    eventoResponse.estaAgotado = false;

    res.status(201).json(eventoResponse);
  } catch (error) {
    console.error('Error en createEvento:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al registrar el nuevo evento',
      error: error.message
    });
  }
};

// @desc    Obtener un evento por su ID
// @route   GET /api/eventos/:id
// @access  Público
exports.getEventoById = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    const eventoResponse = evento.toJSON();
    eventoResponse.cuposDisponibles = Math.max(0, evento.cupoMaximo - evento.totalInscritos);
    eventoResponse.porcentajeOcupacion = Number(((evento.totalInscritos / evento.cupoMaximo) * 100).toFixed(1));
    eventoResponse.estaAgotado = eventoResponse.cuposDisponibles <= 0;

    res.status(200).json(eventoResponse);
  } catch (error) {
    console.error('Error en getEventoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el evento',
      error: error.message
    });
  }
};

