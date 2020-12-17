// Data class
class Data {
    constructor(o) {
        Object.assign(this, o);
    }

    insert() {
        // Writing to influx
        influx.writePoints([
            {
                measurement: 'readings',
                tags: {device: this.deviceId},
                fields: {temperature: this.temperature, humidity: this.humidity}
            }
        ]).catch(error => console.log(`Error saving data! ${error.stack}`));

        // Writing to firestore
        (async () => {
            await db.doc(`readings/${this.deviceId}`).set({
                timestamp: this.timestamp,
                temperature: this.temperature,
                humidity: this.humidity
            })
        })();
    }
}

// Influx
const Influx = require('influx');
const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'sensor_dashboard',
    schema: [
        {
            measurement: 'readings',
            fields: {
                temperature: Influx.FieldType.FLOAT,
                humidity: Influx.FieldType.FLOAT
            },
            tags: ['device']
        }
    ]
});

// Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceKeys/serviceAccountKey.json');
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db = admin.firestore();

// function createDatabase() {
//     influx.getDatabaseNames().then(names => {
//         if (!names.includes('sensor_dashboard')) {
//             return influx.createDatabase('sensor_dashboard');
//         }
//     }).catch(error => console.log(`Error creating database! ${error.stack}`));
// }

// http
const express = require('express');
const app = express();
app.use(express.json());

app.post('/broker', (req, res) => {
    console.log(req.body);
    console.log(typeof req.body);
    new Data(req.body).insert();
    res.status(200);
});

app.get('/reading/:device/:limit', (req, res) => {
    influx.query(`
    select * from readings
    where device = '${req.params.device}'
    order by time desc
    limit ${req.params.limit}
    `).then(result => res.json(result)).catch(error => res.status(500).send(error.stack));
});


// Listen
app.listen(4000);
