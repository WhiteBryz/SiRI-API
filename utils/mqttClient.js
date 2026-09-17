const mqtt = require('mqtt');

let client;

const getClient = () => {
    if (!client) {
        client = mqtt.connect(process.env.MQTT_BROKER_URL);
    }
    return client;
};

module.exports = { getClient };
