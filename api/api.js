const Influx = require('influx');
const express = require('express');
const app = express();

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

app.get('/', (req, res) => {
    influx.query(`
    select * from readings
    order by time desc
    limit 10
    `).then(result => res.json(result)).catch(error => res.status(500).send(error.stack))
});

app.get('/:device/:limit', (req, res) => {
    influx.query(`
    select * from readings
    where device = '${req.params.device}'
    order by time desc
    limit ${req.params.limit}
    `).then(result => res.json(result)).catch(error => res.status(500).send(error.stack))
});

app.listen(3000);
