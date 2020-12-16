const Influx = require('influx');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceKeys/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
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

function createDatabase() {
    influx.getDatabaseNames().then(names => {
        if (!names.includes('sensor_dashboard')) {
            return influx.createDatabase('sensor_dashboard');
        }
    }).catch(error => console.log(`Error creating database! ${error.stack}`));
}

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
                temperature: this.temperature,
                humidity: this.humidity
            })
        })();
    }
}

module.exports = {Data, createDatabase};
