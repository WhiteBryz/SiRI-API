const { getClient } = require('../utils/mqttClient');
const { saveMessageToFirebase } = require('../controllers/mqttController');

const init = () => {
    try {
        const client = getClient();

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            client.subscribe(process.env.MQTT_TOPIC, (err) => {
                if (err) console.error('Subscription error:', err);
            });
        });

        client.on('message', (topic, message) => {
            const msg = message.toString();
            console.log(`Received message on topic ${topic}: ${msg}`);
            saveMessageToFirebase(msg);
        });

    } catch (e) {
        console.error("Error: " + e);
    }
};

module.exports = { init };