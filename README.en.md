# SiRI-API

> 🇪🇸 Leer en español: [README.md](README.md)

Backend service for the **SiRI** IoT monitoring system. It receives sensor readings over MQTT, persists them to Firebase Realtime Database, computes daily statistics, and exposes an HTTP API to query and manage the data.

## Related repositories

SiRI is a three-part system; this repository is the middle layer between the hardware and the frontend:

- **[SiRI-IoT](https://github.com/WhiteBryz/SiRI-IoT)** — ESP32 firmware that reads the sensors and publishes readings over MQTT.
- **SiRI-API** (this repository) — Express server that subscribes to the MQTT topic, saves data to Firebase, and exposes HTTP endpoints.
- **[AimsMovilApp](https://github.com/JoelGarciaDev/AimsMovilApp)** — Mobile app that consumes the data to display it to the user.

## Architecture / data flow

```
ESP32 (SiRI-IoT) --MQTT--> SiRI-API --Firebase RTDB--> AimsMovilApp
```

On startup, the server connects to the MQTT broker and subscribes to the configured topic (`MQTT_TOPIC`). Every incoming message is saved to Firebase and triggers a recalculation of daily statistics. The API also exposes HTTP endpoints to read stored readings, publish messages to any topic, or subscribe to new topics at runtime.

## Tech stack

- Node.js + [Express](https://expressjs.com/) 4
- [mqtt](https://www.npmjs.com/package/mqtt) (MQTT client)
- [Firebase](https://firebase.google.com/) (client SDK, Realtime Database)
- [dotenv](https://www.npmjs.com/package/dotenv) for environment variables

## Project structure

```
config/       Firebase configuration and initialization
controllers/  HTTP request handlers (business logic)
routes/       Express route definitions
services/     MQTT client bootstrap (connection, initial subscription)
utils/        Shared MQTT client, date utilities, statistics calculation
index.js      Application entry point
```

## Environment variables

The `.env` file is not versioned (it's in `.gitignore`); create it locally with the following variables:

| Variable | Description | Required |
|---|---|---|
| `PORT` | HTTP port for the server | No (defaults to `3000`) |
| `MQTT_BROKER_URL` | MQTT broker URL (e.g. `mqtt://host:1883`) | Yes |
| `MQTT_TOPIC` | Topic the server subscribes to on startup | Yes |
| `FIREBASE_API_KEY` | Firebase project API key | Yes |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `FIREBASE_DATABASE_URL` | Realtime Database URL | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID | Yes |
| `FIREBASE_APP_ID` | Firebase app ID | Yes |

## Getting started

```bash
git clone <this-repository-url>
cd SiRI-API
npm install
# create a .env file with the variables listed above
node index.js
```

The server will listen on `http://localhost:<PORT>` (3000 by default) and, in parallel, stay connected to the MQTT broker.

> Note: `package.json` does not currently define a `start` script, so the app is run directly with `node index.js`.

## HTTP API

All routes are mounted under the `/api/mqtt` prefix.

### `GET /api/mqtt/messages`

Returns the contents of the `messages` node in Firebase.

### `POST /api/mqtt/publish`

Publishes a message to an MQTT topic.

```json
{
  "topic": "siri/example",
  "message": "hello"
}
```

### `POST /api/mqtt/subscribe`

Subscribes the server's MQTT client to a new topic at runtime.

```json
{
  "topic": "siri/another-topic"
}
```

## Firebase data model

Each reading received over MQTT is saved at:

```
Readings/{year}/{month}/{day}/{timestamp}
```

with the fields: `fecha`, `hora`, `timestamp`, `humedadAmbiente`, `humedadSuelo`, `iluminacion`, `nivelAgua`, `temperaturaAmbiente`.

After each write, the day's statistics are recalculated and stored at:

```
Statistics/daily
```

with the min, max, and average per field, plus the last processed timestamp.
