const express = require('express');
const router = express.Router();

// Rota para obter a chave da API do Google Maps
router.get('/maps-key', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

module.exports = router; 