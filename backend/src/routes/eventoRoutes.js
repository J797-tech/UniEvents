const express = require('express');
const router = express.Router();
const {
  getEventos,
  createEvento,
  getEventoById
} = require('../controllers/eventoController');

// Rutas de eventos según especificación REST
router.route('/')
  .get(getEventos)
  .post(createEvento);

router.route('/:id')
  .get(getEventoById);

module.exports = router;

