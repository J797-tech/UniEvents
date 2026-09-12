const express = require('express');
const router = express.Router();
const {
  createInscripcion,
  getInscripcionesByEvento
} = require('../controllers/inscripcionController');

// Rutas de inscripciones según especificación REST
router.route('/')
  .post(createInscripcion);

router.route('/evento/:eventoId')
  .get(getInscripcionesByEvento);

module.exports = router;

