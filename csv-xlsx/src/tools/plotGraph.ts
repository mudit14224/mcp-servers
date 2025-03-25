import * as fs from 'fs';
import * as path from 'path';
import { readData } from './shared.js';
import { Chart, registerables } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { createCanvas } from 'canvas';
Chart.register(...registerables, MatrixController, MatrixElement); 

export async function plotGraph(
    filePath: string,
    graphType: string,
    xColumn: string,
    yColumn: string | null,  // yColumn is optional (can be null)
    outputFileName: string
) {
    try {
        const workDir = process.env.WORK_DIR 

        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }

        filePath = workDir + "/" + filePath
        const data = readData(filePath)
        const xValues = data.map((row: any) => row[xColumn]);

        let yValues: any[] = [];
        if (yColumn) {
            yValues = data.map((row: any) => row[yColumn])
        } else {
            yValues = xValues.map(() => 0)
        }

        // Create canvas for chart.js to render
        const canvas = createCanvas(800, 600)
        const ctx = canvas.getContext('2d')

        enum ChartTypes {
            Line = 'line',
            Bar = 'bar',
            Pie = 'pie',
            Doughnut = 'doughnut',
            Radar = 'radar',
            Scatter = 'scatter',
            PolarArea = 'polarArea',
            Bubble = 'bubble',
        }

        // Create the chart
        const chart = new Chart(ctx as any, {
            type: graphType as ChartTypes, // 'line', 'bar', etc.
            data: {
                labels: xValues,
                datasets: [{
                    label: yColumn || 'Default Y', // Use yColumn or 'Default Y' if yColumn is not available
                    data: yValues,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: xColumn
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yColumn || 'Default Y'
                        }
                    }
                }
            }
        });
        // Save the chart as an image (PNG)
        const buffer = canvas.toBuffer('image/png');

        const graphsFolderPath = path.join(workDir, 'claude-graphs');

        // Check if the claude-graphs folder exists
        if (!fs.existsSync(graphsFolderPath)) {
            // Create the folder if it doesn't exist
            fs.mkdirSync(graphsFolderPath, { recursive: true });
        }

        const outputFilePath = path.join(graphsFolderPath, outputFileName);

        fs.writeFileSync(outputFilePath, buffer);

        return {
            content: [{
                type: "text",
                text: `The graph has been plotted and saved to: ${outputFileName} path`
            }],
            isError: false
        };


    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
        };
    }
}