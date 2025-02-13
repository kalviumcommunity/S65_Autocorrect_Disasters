const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image-controller');

router.post('/images', imageController.createImage);
router.get('/images', imageController.getImages);

module.exports = router;