# SiRI-API

> 🇬🇧 Read this in English: [README.en.md](README.en.md)

Servicio backend del sistema de monitoreo IoT **SiRI**. Recibe lecturas de sensores vía MQTT, las persiste en Firebase Realtime Database, calcula estadísticas diarias y expone una API HTTP para consultar y gestionar los datos.

## Repositorios relacionados

SiRI es un sistema compuesto por tres partes; este repositorio es la capa intermedia entre el hardware y el frontend:

- **[SiRI-IoT](https://github.com/WhiteBryz/SiRI-IoT)** — Firmware del ESP32 que lee los sensores y publica las lecturas por MQTT.
- **SiRI-API** (este repositorio) — Servidor Express que se suscribe al tópico MQTT, guarda los datos en Firebase y expone endpoints HTTP.
- **[AimsMovilApp](https://github.com/JoelGarciaDev/AimsMovilApp)** — Aplicación móvil que consume los datos para mostrarlos al usuario.

## Arquitectura / flujo de datos

```
ESP32 (SiRI-IoT) --MQTT--> SiRI-API --Firebase RTDB--> AimsMovilApp
```

Al iniciar, el servidor se conecta al broker MQTT y se suscribe al tópico configurado (`MQTT_TOPIC`). Cada mensaje recibido se guarda en Firebase y dispara el recálculo de estadísticas diarias. Además, la API expone endpoints HTTP para leer las lecturas guardadas, publicar mensajes en cualquier tópico o suscribirse a nuevos tópicos en tiempo de ejecución.

## Stack técnico

- Node.js + [Express](https://expressjs.com/) 4
- [mqtt](https://www.npmjs.com/package/mqtt) (cliente MQTT)
- [Firebase](https://firebase.google.com/) (SDK cliente, Realtime Database)
- [dotenv](https://www.npmjs.com/package/dotenv) para variables de entorno

## Estructura del proyecto

```
config/       Configuración e inicialización de Firebase
controllers/  Manejadores de las peticiones HTTP (lógica de negocio)
routes/       Definición de rutas de Express
services/     Bootstrap del cliente MQTT (conexión, suscripción inicial)
utils/        Cliente MQTT compartido, utilidades de fecha y cálculo de estadísticas
index.js      Punto de entrada de la aplicación
```

## Variables de entorno

El archivo `.env` no se versiona (está en `.gitignore`); debes crearlo localmente con las siguientes variables:

| Variable | Descripción | Requerida |
|---|---|---|
| `PORT` | Puerto HTTP del servidor | No (por defecto `3000`) |
| `MQTT_BROKER_URL` | URL del broker MQTT (ej. `mqtt://host:1883`) | Sí |
| `MQTT_TOPIC` | Tópico al que se suscribe el servidor al iniciar | Sí |
| `FIREBASE_API_KEY` | API key del proyecto Firebase | Sí |
| `FIREBASE_AUTH_DOMAIN` | Auth domain de Firebase | Sí |
| `FIREBASE_DATABASE_URL` | URL de la Realtime Database | Sí |
| `FIREBASE_PROJECT_ID` | ID del proyecto Firebase | Sí |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket de Firebase | Sí |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID de Firebase Messaging | Sí |
| `FIREBASE_APP_ID` | App ID de Firebase | Sí |

## Puesta en marcha

```bash
git clone <url-de-este-repositorio>
cd SiRI-API
npm install
# crear el archivo .env con las variables listadas arriba
node index.js
```

El servidor quedará escuchando en `http://localhost:<PORT>` (3000 por defecto) y, en paralelo, conectado al broker MQTT.

> Nota: el `package.json` no define actualmente un script `start`; por eso se ejecuta directamente con `node index.js`.

## API HTTP

Todas las rutas están montadas bajo el prefijo `/api/mqtt`.

### `GET /api/mqtt/messages`

Devuelve el contenido del nodo `messages` de Firebase.

### `POST /api/mqtt/publish`

Publica un mensaje en un tópico MQTT.

```json
{
  "topic": "siri/ejemplo",
  "message": "hola"
}
```

### `POST /api/mqtt/subscribe`

Suscribe el cliente MQTT del servidor a un nuevo tópico en tiempo de ejecución.

```json
{
  "topic": "siri/otro-topico"
}
```

## Modelo de datos en Firebase

Cada lectura recibida por MQTT se guarda en:

```
Readings/{año}/{mes}/{día}/{timestamp}
```

con los campos: `fecha`, `hora`, `timestamp`, `humedadAmbiente`, `humedadSuelo`, `iluminacion`, `nivelAgua`, `temperaturaAmbiente`.

Tras cada escritura se recalculan las estadísticas del día y se guardan en:

```
Statistics/daily
```

con el mínimo, máximo y promedio por campo, más el último timestamp procesado.
