function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

function initChart(ctx, data) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [getTime(data.timestamp)],
            datasets: [
                {
                    label: 'Temperature',
                    data: [data.temperature.toFixed(2)],
                    borderColor: 'rgba(255, 165, 0, 1)',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)'
                }, {
                    label: 'Humidity',
                    data: [data.humidity.toFixed(2)],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Live updates'
            },
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
    // Create display for device
    const div = document.createElement("div");
    div.innerHTML = `
    <div style="clear: both"></div>
    <div class="row">
        <table style="float: left">
            <tr>
                <th colspan="3">${device}</th>
            </tr>
            <tr>
                <td>Last updated</td>
                <td id="${device}/update">{{ message }}</td>
                <td rowspan="4"><canvas id="${device}/graph"></canvas></td>
            </tr>
            <tr>
                <td>Temperature</td>
                <td id="${device}/temperature">{{ message }}</td>
            </tr>
            <tr>
                <td>Humidity</td>
                <td id="${device}/humidity">{{ message }}</td>
            </tr>
            <tr>
                <td colspan="2" style="vertical-align: top"><button id="${device}/details" type="button">details</button></td>
            </tr>
        </table>
    </div>
    `;
    document.body.appendChild(div);

    // Init params
    devices[device] = {
        update: new Vue({el: `[id="${device}/update"]`, data: {message: '-'}}),
        temperature: new Vue({el: `[id="${device}/temperature"]`, data: {message: '-'}}),
        humidity: new Vue({el: `[id="${device}/humidity"]`, data: {message: '-'}}),
        details: document.getElementById(`${device}/details`),
        chart: initChart(document.getElementById(`${device}/graph`).getContext('2d'), data)
    }
    devices[device].details.onclick = () => alert(`${device} details`);
}

function updateDevice(device, timestamp, temperature, humidity) {
    devices[device].update.message = timestamp;
    devices[device].temperature.message = temperature;
    devices[device].humidity.message = humidity;

    // Update chart
    const chart = devices[device].chart;
    if (chart.data.labels.length >= 10) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
    }

    chart.data.labels.unshift(timestamp);
    chart.data.datasets[0].data.unshift(temperature);
    chart.data.datasets[1].data.unshift(humidity);
    chart.update();
}
