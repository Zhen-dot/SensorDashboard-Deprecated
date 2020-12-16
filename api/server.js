require('dotenv').config();
const mqtt = require('mqtt');
const {Data, createDatabase} = require("./module");

const {
    MQTT_HOST = 'localhost',
    TEMP_DEVICE_COUNT = 3,
} = process.env;

createDatabase();

const topics = [...Array(TEMP_DEVICE_COUNT).keys()].map(i => `site-a/data/dummy-temp-${i + 1}/temp`);
console.log(topics);

const client = mqtt.connect(`mqtt://${MQTT_HOST}`);

client.subscribe(topics, {qos: 1});

client.on("connect", () => {
    console.log(`connection flag: ${client.connected}`);
});

client.on("error", (error) => {
    console.log(`connection error encountered ${error}`);
});

client.on("message", (topic, message, packet) => {
    console.log(`Message received\n topic: ${topic}\n message: ${message}\n`);
    const o = new Data(JSON.parse(message.toString()));
    o.insert();
});
