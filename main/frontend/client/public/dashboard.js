function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

function initDevice(device, data) {
    sensors[device] = {
        temperature: document.getElementById(`${device}/temperature`),
        humidity: document.getElementById(`${device}/humidity`),
        chart: new Chart(document.getElementById(`${device}/graph`).getContext('2d'), {
            type: 'line',
            data: {
                labels: data.map(d => getTime(d.time)),
                datasets: [
                    {
                        label: 'Temperature',
                        data: data.map(d => d.temperature.toFixed(2)),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                    }, {
                        label: 'Humidity',
                        data: data.map(d => d.humidity.toFixed(2)),
                        borderColor: 'rgba(192, 192, 192, 1)',
                        backgroundColor: 'rgba(192, 192, 192, 0.2)'
                    },
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
            }
        })
    }
}

function updateDevice(sensor, time, temperature, humidity) {
    sensors[sensor].temperature.innerText = temperature;
    sensors[sensor].humidity.innerText = humidity;

    // Update chart
    const chart = sensors[sensor].chart;
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.data.labels.unshift(getTime(time));
    chart.data.datasets[0].data.unshift(temperature);
    chart.data.datasets[1].data.unshift(humidity);
    chart.update();
}

let sensors = {}
const socket = io();

socket.on('init', (msg) => {
    initDevice(msg.device, msg.plotdata);
});

socket.on('realtime', (msg) => {
    updateDevice(msg.sensor, msg.time, msg.temperature.toFixed(2), msg.humidity.toFixed(2));
});

