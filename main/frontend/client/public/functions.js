function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

function initRealtimeChart(ctx, data) {
    console.log(ctx, data);
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [getTime(data.timestamp)],
            datasets: [
                {
                    label: 'Temperature',
                    data: [data.temperature.toFixed(2)],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                }, {
                    label: 'Humidity',
                    data: [data.humidity.toFixed(2)],
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

function initDevice(device, data) {
    console.log(device, data)
    console.log(sensors)
    sensors[device] = {
        temperature: document.getElementById(`${device}/temperature`),
        humidity: document.getElementById(`${device}/humidity`),
        chart: initRealtimeChart(document.getElementById(`${device}/graph`).getContext('2d'), data)
    }
}

function updateDevice(sensor, time, temperature, humidity) {
    sensors[sensor].temperature.innerText = temperature;
    sensors[sensor].humidity.innerText = humidity;

    // Update chart
    const chart = sensors[sensor].chart;
    if (chart.data.labels.length >= 10) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
    };
    chart.data.labels.unshift(getTime(time));
    chart.data.datasets[0].data.unshift(temperature);
    chart.data.datasets[1].data.unshift(humidity);
    chart.update();
}
