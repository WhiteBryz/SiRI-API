const express = require('express');
const router = express.Router();
const mqttService = require('../services/mqttService');
const mqttController = require('../controllers/mqttController');

// Ruta para obtener todos los mensajes recibidos de MQTT
router.get('/messages', mqttController.getMessages);

// Ruta para publicar un mensaje en un topic MQTT
router.post('/publish', mqttController.publishMessage);

// Ruta para suscribirse a un nuevo topic desde la API 
router.post('/subscribe', mqttController.subscribeToTopic);
