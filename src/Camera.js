export class CameraOpenCV {
    constructor(OpenCVid) {
        this.data_OpenCV = document.getElementById(OpenCVid);
        this.InnerHTML_OpenCV();
        this.setupCanvas();
    }

    InnerHTML_OpenCV() {
        this.data_OpenCV.innerHTML = `
            <div id="buttonContainer">
                <button id="toggleDetectingEl">Start Detecting</button>
                <button id="resetPageEl">Reset</button>
            </div>
            <div id="container">
                <div id="videoContainer"></div>
                <div id="dataContainer">
                    <canvas id="chart"></canvas>
                    <div id="detectionData">
                        ${this.createEmptyTable()} 
                    </div>
                </div>
            </div>
        `;
    }

    setupCanvas() {
        const sketch = (p) => {
            let video;
            let detector;
            let detections = [];
            let detecting = false;
            let chart;

            p.setup = () => {
                const canvas = p.createCanvas(640, 480);
                canvas.parent('videoContainer');
                video = p.createCapture(p.VIDEO, () => {
                    console.log('Video capture started');
                    video.size(640, 480);
                });
                video.hide(); 
                detector = ml5.objectDetector('cocossd', () => {
                    console.log('Detector object is loaded');
                });
                this.addEventListeners();
                this.initializeChart();
                document.body.style.cursor = 'default';
            };

            p.draw = () => {
                p.image(video, 0, 0);
                if (!detecting) return; 
                detections.forEach(object => {
                    p.stroke('green');
                    p.strokeWeight(4);
                    p.noFill();
                    p.rect(object.x, object.y, object.width, object.height);
                    p.noStroke();
                    p.fill('white');
                    p.textSize(24);
                    p.text(object.label, object.x + 10, object.y + 24);
                });
            };

            function onDetected(error, results) {
                if (error) {
                    console.error('Detection error:', error);
                    return;
                }
                detections = results;
                updateDetectionData(detections);
                if (detecting) {
                    detect();
                }
            }

            function detect() {
                detector.detect(video, onDetected);
            }

            function updateDetectionData(detections) {
                const detectionDataEl = document.getElementById('detectionData');
                if (detectionDataEl) {
                    const table = createTable(detections);
                    detectionDataEl.innerHTML = table;
                    console.log(JSON.stringify(detections, null, 2));
                    updateChart(detections); 
                } else {
                    console.error('Detection data element not found');
                }
            }

            function createTable(detections) {
                let html = '<table><thead><tr>';
                
                html += '<th>Label</th><th>Confidence</th><th>X</th><th>Y</th><th>Width</th><th>Height</th><th>Normalized X</th><th>Normalized Y</th><th>Normalized Width</th><th>Normalized Height</th>';
                html += '</tr></thead><tbody>';
                
                if (detections.length === 0) {
                    html += '<tr><td colspan="10">No detections yet</td></tr>';
                } else {
                    detections.forEach(detection => {
                        html += '<tr>';
                        html += `<td>${detection.label}</td>`;
                        html += `<td>${(detection.confidence * 100).toFixed(2)}%</td>`;
                        html += `<td>${detection.x.toFixed(2)}</td>`;
                        html += `<td>${detection.y.toFixed(2)}</td>`;
                        html += `<td>${detection.width.toFixed(2)}</td>`;
                        html += `<td>${detection.height.toFixed(2)}</td>`;
                        html += `<td>${(detection.normalized.x * 100).toFixed(2)}%</td>`;
                        html += `<td>${(detection.normalized.y * 100).toFixed(2)}%</td>`;
                        html += `<td>${(detection.normalized.width * 100).toFixed(2)}%</td>`;
                        html += `<td>${(detection.normalized.height * 100).toFixed(2)}%</td>`;
                        html += '</tr>';
                    });
                }
                
                html += '</tbody></table>';
                return html;
            }

            function updateChart(detections) {
                if (chart) {
                    const labels = detections.map(d => d.label);
                    const xData = detections.map(d => d.x);
                    const yData = detections.map(d => d.y);
                    const confidenceData = detections.map(d => d.confidence * 100);

                    chart.data.labels = labels;
                    chart.data.datasets[0].data = xData;
                    chart.data.datasets[1].data = yData;
                    chart.data.datasets[2].data = confidenceData;
                    chart.update();
                }
            }

            this.addEventListeners = () => {
                const toggleDetectingEl = document.getElementById('toggleDetectingEl');
                const resetPageEl = document.getElementById('resetPageEl'); 
            
                if (toggleDetectingEl) {
                    toggleDetectingEl.addEventListener('click', () => {
                        if (!detecting) {
                            detect(); 
                            toggleDetectingEl.innerText = 'Stop Detecting';
                        } else {
                            toggleDetectingEl.innerText = 'Start Detecting';
                        }
                        detecting = !detecting;
                    });
                } else {
                    console.error('Toggle element not found');
                }
            
                if (resetPageEl) {
                    resetPageEl.addEventListener('click', () => {
                        location.reload(); 
                    });
                } else {
                    console.error('Reset element not found');
                }
            };

            this.initializeChart = () => {
                const ctx = document.getElementById('chart').getContext('2d');
                chart = new Chart(ctx, {
                    type: 'bar', 
                    data: {
                        labels: [], 
                        datasets: [
                            {
                                type: 'line',
                                label: 'X Coordinates',
                                data: [],
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderWidth: 1,
                                fill: false
                            },
                            {
                                type: 'line',
                                label: 'Y Coordinates',
                                data: [],
                                borderColor: 'rgba(153, 102, 255, 1)',
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                                borderWidth: 1,
                                fill: false
                            },
                            {
                                type: 'bar',
                                label: 'Confidence',
                                data: [], 
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                borderColor: 'rgba(255, 159, 64, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Label'
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Values'
                                }
                            }
                        }
                    }
                });
            };
        };

        new p5(sketch);
    }

    createEmptyTable() {
        return `
            <table>
                <thead>
                    <tr>
                        <th>Label</th>
                        <th>Confidence</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Width</th>
                        <th>Height</th>
                        <th>Normalized X</th>
                        <th>Normalized Y</th>
                        <th>Normalized Width</th>
                        <th>Normalized Height</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="10">No detections yet</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}
