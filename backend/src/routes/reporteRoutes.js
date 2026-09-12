const express = require('express');
const router = express.Router();
const { getReporteAforo } = require('../controllers/reporteController');

// Ruta de reportes de aforo
router.route('/aforo')
  .get(getReporteAforo);

module.exports = router;

