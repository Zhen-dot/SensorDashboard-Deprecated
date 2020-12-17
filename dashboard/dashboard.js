const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const admin = require('firebase-admin');
const serviceAccount = require('../api/serviceKeys/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const devices = Array('dummy-temp-1', 'dummy-temp-2', 'dummy-temp-3');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Server-Client connection
io.on('connection', (socket) => {
    console.log('a user connected');
    for (const device of devices) {
        require('http').get(`http://localhost:4000/reading/${device}/10`, res => {
            res.on('data', (data) => {
                io.emit('init', {device: device, plotdata: JSON.parse(data.toString())});
            });
        });
    }
});

// Updates realtime data
for (const device of devices) {
    db.collection('readings').doc(device).onSnapshot(snapshot => {
        const data = snapshot.data();
        io.emit('realtime', {sensor: device, temperature: data.temperature, humidity: data.humidity, time: data.timestamp});
    }, error => {
        console.log(`Encountered error: ${error}`);
    });
}

// // Updates plot every 10s
// const interval = 5; // seconds
// setInterval(() => {
//     for (const device of devices) {
//         require('http').get(`http://localhost:3000/${device}/10`, res => {
//             res.on('data', (data) => {
//                 io.emit('plot', JSON.parse(data.toString()));
//             });
//         });
//     }
// }, interval * 1000);
