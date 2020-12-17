const firebaseConfig = {
    apiKey: "AIzaSyBC7oxn8XeQVhD2MlM913K2DmcOnYUy24U",
    authDomain: "sensordashboard-c797c.firebaseapp.com",
    projectId: "sensordashboard-c797c",
    storageBucket: "sensordashboard-c797c.appspot.com",
    messagingSenderId: "932401489854",
    appId: "1:932401489854:web:c092e82c06477aa0c0fbef",
    measurementId: "G-YVEX7TZ59Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore().collection('readings');

let devices = {};

(async () => {
    await db.get().then(docs => {
        docs.forEach(doc => {
            initDevice(doc.id, doc.data());
            db.doc(doc.id).onSnapshot(snapshot => {
                const data = snapshot.data();
                updateDevice(doc.id, getTime(data.timestamp), data.temperature.toFixed(2), data.humidity.toFixed(2));
            })
        })
    })
})();

