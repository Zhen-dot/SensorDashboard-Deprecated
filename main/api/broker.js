require('dotenv').config();
const mqtt = require('mqtt');

const {
    MQTT_HOST = 'localhost',
    TEMP_DEVICE_COUNT = 3,
} = process.env;


// Start mosquitto server
const { exec } = require('child_process');
exec("mosquitto", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

const topics = [...Array(TEMP_DEVICE_COUNT).keys()].map(i => `site-a/data/dummy-temp-${i + 1}/temp`);
console.log(topics);

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// Mosquitto
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

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:4000/broker', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(message.toString());
});