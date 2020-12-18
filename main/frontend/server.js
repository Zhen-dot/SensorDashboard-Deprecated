// Server methods
const express = require('express');
const app = express();
const http = require('http').createServer(app);

app.use(express.static(__dirname + '/client'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/dashboard.html');
});

// Start server
http.listen(3000, () => {
    console.log('Server running on port 3000');
});
