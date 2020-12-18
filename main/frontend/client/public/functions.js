function getTime(time) {
    return new Date(time).toLocaleTimeString()
}

function initChart(ctx, title, data, limit) {
    if (data.length > limit) data = data.slice(0, limit);

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => getTime(d.time)),
            datasets: [
                {
                    label: 'Temperature',
                    data: data.map(d => d.temperature.toFixed(2)),
                    borderColor: 'rgba(255, 165, 0, 1)',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)'
                }, {
                    label: 'Humidity',
                    data: data.map(d => d.humidity.toFixed(2)),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                },
            ]
        },
        // plugins: [ChartDataLabels],
        options: {
            // align: 'top',
            // offset: 100,
            title: {
                display: true,
                text: title
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
        <div id="${device}/modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close">&times;</span>
                    <h2>${device}'s Modal</h2>
                </div>
                <div class="modal-body">
                    <canvas id="${device}/details_graph" class="details_canvas"></canvas>
                    <p>${device}'s details</p>
                </div>
            </div>
        </div>
    <div class="row">
        <table style="float: left">
            <tr>
                <th colspan="3">${device}</th>
            </tr>
            <tr>
                <td>Last updated</td>
                <td id="${device}/update">{{ message }}</td>
                <td rowspan="4"><canvas id="${device}/realtime_graph" class="realtime_canvas"></canvas></td>
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
                <td colspan="2" style="vertical-align: top"><button id="${device}/detailsBtn" type="button">details</button></td>
            </tr>
        </table>
    </div>
    `;
    // Append html to document
    document.body.appendChild(div);

    // Init params
    devices[device] = {
        update: new Vue({el: `[id="${device}/update"]`, data: {message: '-'}}),
        temperature: new Vue({el: `[id="${device}/temperature"]`, data: {message: '-'}}),
        humidity: new Vue({el: `[id="${device}/humidity"]`, data: {message: '-'}}),
        detailsBtn: document.getElementById(`${device}/detailsBtn`),
        modal: document.getElementById(`${device}/modal`),
        details_graph: initChart(document.getElementById(`${device}/details_graph`).getContext('2d'), `Last ${1} updates`, [data], 1),
        realtime_graph: initChart(document.getElementById(`${device}/realtime_graph`).getContext('2d'), 'Live Updates',[data], 10)
    }

    // Show modal
    devices[device].detailsBtn.onclick = () => {
        // Calculations
        const lim = 50;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:4000/reading/${device}/${lim}`);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const chart = devices[device].details_graph;

                // Update data
                const q_data = JSON.parse(xhr.responseText);
                chart.data.labels = q_data.map(o => getTime(o.time));
                chart.data.datasets[0].data = q_data.map(o => o.temperature.toFixed(2));
                chart.data.datasets[1].data = q_data.map(o => o.humidity.toFixed(2));

                // Update title & refresh
                chart.options.title.text = `Last ${lim} updates`
                chart.update();
                devices[device].modal.style.display = "block";
            }
        }
    }

    // Close modal
    const closes = document.getElementsByClassName("close");
    closes[closes.length - 1].onclick = () => devices[device].modal.style.display = "none";
}

function updateDevice(device, time, temperature, humidity) {
    devices[device].update.message = time;
    devices[device].temperature.message = temperature;
    devices[device].humidity.message = humidity;

    // Update realtime graph
    const chart = devices[device].realtime_graph;
    if (chart.data.labels.length >= 10) {
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
    }

    chart.data.labels.unshift(time);
    chart.data.datasets[0].data.unshift(temperature);
    chart.data.datasets[1].data.unshift(humidity);
    chart.update();
}
