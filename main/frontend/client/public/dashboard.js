function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

window.onload = () => {
    let sensors = {}
    const socket = io();
    socket.on('init', (msg) => {
        const device = msg.device;
        const data = msg.plotdata;
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
                    }
                }
            })
        };
    });

    socket.on('realtime', (msg) => {
        sensors[msg.sensor].temperature.innerText = msg.temperature.toFixed(2);
        sensors[msg.sensor].humidity.innerText = msg.humidity.toFixed(2);
        const chart = sensors[msg.sensor].chart;
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
        chart.data.labels.unshift(getTime(msg.time));
        chart.data.datasets[0].data.unshift(msg.temperature.toFixed(2));
        chart.data.datasets[1].data.unshift(msg.humidity.toFixed(2));
        chart.update();
    });
}
