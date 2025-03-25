import * as fs from 'fs';
import * as path from 'path';
import * as dfd from 'danfojs-node';
import { ToolResponseType } from '../types.js';
import { readData } from './shared.js';
import { Chart, registerables } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { createCanvas } from 'canvas';
Chart.register(...registerables, MatrixController, MatrixElement); 

async function computeCorrelationMatrix(df: dfd.DataFrame): Promise<dfd.DataFrame> {
    const cols = df.columns;
    const result: number[][] = [];

    for (let i = 0; i < cols.length; i++) {
        result[i] = [];
        const col1 = df[cols[i]].values as number[];
        for (let j = 0; j < cols.length; j++) {
            const col2 = df[cols[j]].values as number[];
            const corr = await pearsonCorrelation(col1, col2);  // Await inside loop (OK for small data)
            result[i][j] = corr;
        }
    }

    return new dfd.DataFrame(result, { columns: cols, index: cols });
}

// Helper functions for Correlation matrix
async function pearsonCorrelation(x: number[], y: number[]): Promise<number> {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    return numerator / Math.sqrt(denomX * denomY);
}


// Get Correlation matrix function
export async function generateCorrelationMatrix(filePath: string, plot: boolean): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR;
        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable");
        }

        const fullFilePath = path.join(workDir, filePath);

        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }

        const data = readData(fullFilePath); 

        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }

        const dataframe = new dfd.DataFrame(data);

        // Filter numerical columns
        const numericalColumns = dataframe.dtypes
            .map((dtype, index) => ({ dtype, index }))
            .filter(({ dtype }) => dtype !== 'string')
            .map(({ index }) => dataframe.columns[index]);

        const numericalDf = new dfd.DataFrame(dataframe.loc({ columns: numericalColumns }).values, {
            columns: numericalColumns,
        });

        const correlationMatrix = await computeCorrelationMatrix(numericalDf);
        const correlationJson = correlationMatrix.toJSON();

        if (plot) {
            const canvas = createCanvas(800, 600);
            const ctx = canvas.getContext('2d');

            const labels = numericalColumns;
            const dataValues = correlationMatrix.values as number[][];

            new Chart(ctx as any, {
                type: 'matrix', 
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues.flatMap((row: number[], rowIndex: number) =>
                            row.map((value, colIndex) => ({
                                x: labels[colIndex],
                                y: labels[rowIndex],
                                value: value,
                            }))
                        ),
                        backgroundColor: (context: any) => {
                            const value = context.dataset.data[context.dataIndex].value;
                            const alpha = (value + 1) / 2;
                            return `rgba(0, 0, 255, ${alpha})`;
                        },
                    }],
                },
                options: {
                    scales: {
                        x: { type: 'category' },
                        y: { type: 'category' },
                    },
                    plugins: {
                        legend: { display: false },
                    },
                },
            });

            const graphsFolderPath = path.join(workDir, 'claude-graphs');
            if (!fs.existsSync(graphsFolderPath)) {
                fs.mkdirSync(graphsFolderPath, { recursive: true });
            }

            const fileName = path.basename(filePath);
            const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            const outputFileName = `${fileNameWithoutExt}_corr.png`;
            const outputFilePath = path.join(graphsFolderPath, outputFileName);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputFilePath, buffer);

            return {
                content: [{
                    type: "text",
                    text: `Correlation matrix plot saved to: ${outputFileName}`,
                }],
                isError: false,
            };
        } else {
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(correlationJson, null, 2),
                }],
                isError: false,
            };
        }
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            }],
            isError: true,
        };
    }
}