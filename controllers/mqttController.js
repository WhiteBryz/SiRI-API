const { database } = require('../config/firebase');
const { ref, set, get } = require('firebase/database');
const { getDateParts } = require('../utils/dateUtils');
const { buildDailyStatistics } = require('../utils/statistics');
const { getClient } = require('../utils/mqttClient');

const saveMessageToFirebase = async (msg) => {
    try {
        const timestamp = Date.now();
        const currentJsonInfo = JSON.parse(msg);

        const { year, month, day } = getDateParts(timestamp);
        const lecturaPath = `Readings/${year}/${month}/${day}/${timestamp}`;

        // Guardar la nueva lectura
        await set(ref(database, lecturaPath), {
            fecha: currentJsonInfo.fecha,
            hora: currentJsonInfo.hora,
            timestamp: currentJsonInfo.timestamp,
            humedadAmbiente: currentJsonInfo.humedadAmbiente,
            humedadSuelo: currentJsonInfo.humedadSuelo,
            iluminacion: currentJsonInfo.iluminacion,
            nivelAgua: currentJsonInfo.nivelAgua,
            temperaturaAmbiente: currentJsonInfo.temperaturaAmbiente,
        });

        // Obtener todas las lecturas del día
        const lecturasRef = ref(database, `Readings/${year}/${month}/${day}`);
        const lecturasSnapshot = await get(lecturasRef);
        const lecturas = lecturasSnapshot.exists() ? Object.values(lecturasSnapshot.val()) : [];

        if (lecturas.length === 0) {
            console.log("No hay lecturas para calcular estadísticas.");
            return;
        }

        // Calcular estadísticas para cada campo
        const estadisticas = buildDailyStatistics(currentJsonInfo, lecturas);

        // Actualizar las estadísticas diarias
        const statsRef = ref(database, `Statistics/daily`);
        await set(statsRef, estadisticas);

        console.log("Lectura guardada y estadísticas actualizadas.");
    } catch (error) {
        console.error("Error saving message to Firebase:", error);
    }
};

const getMessages = async (req, res) => {
    try {
        const snapshot = await get(ref(database, 'messages'));
        const messages = snapshot.exists() ? snapshot.val() : {};
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
};

const publishMessage = (req, res) => {
    const { topic, message } = req.body;
    const client = getClient();

    client.publish(topic, message, (error) => {
        if (error) {
            res.status(500).json({ error: 'Failed to publish message' });
        } else {
            res.status(200).json({ message: `Message published to topic ${topic}` });
        }
    });
};

const subscribeToTopic = (req, res) => {
    const { topic } = req.body;
    const client = getClient();

    client.subscribe(topic, (error) => {
        if (error) {
            res.status(500).json({ error: 'Failed to subscribe to topic' });
        } else {
            res.status(200).json({ message: `Subscribed to topic ${topic}` });
        }
    });
};

module.exports = {
    saveMessageToFirebase,
    getMessages,
    publishMessage,
    subscribeToTopic
};
