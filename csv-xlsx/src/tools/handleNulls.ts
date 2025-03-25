import * as fs from 'fs';
import * as path from 'path';
import * as dfd from 'danfojs-node';
import { ToolResponseType } from '../types.js';
import { readData } from './shared.js';
import { forwardFill, backwardFill } from './shared.js';


export async function handleNullValues(filePath: string, strategy: string, columns: string[]): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR;
        if (!workDir) throw new Error("Cannot find WORK_DIR environment variable.");

        const fullFilePath = path.join(workDir, filePath);
        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }

        const data = readData(fullFilePath); 
        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }

        const dataFrame = new dfd.DataFrame(data);
        const selectedColumns = (columns && columns.length > 0) ? columns : dataFrame.columns;
        for (const col of selectedColumns) {
            if (!dataFrame.columns.includes(col)) {
                return {
                    content: [{ type: "text", text: `Error: Column '${col}' not found in the DataFrame.` }],
                    isError: true,
                };
            }
            const series = dataFrame[col];

            switch (strategy) {
                case 'remove':
                    dataFrame.dropNa({ axis: 0, inplace: true, subset: [col] } as any);
                    break;
                case 'mean':
                    dataFrame.fillNa(series.mean(), { columns: [col], inplace: true });
                    break;
                case 'median':
                    dataFrame.fillNa(series.median(), { columns: [col], inplace: true });
                    break;
                case 'mode':
                    const modeVal = series.mode()[0];
                    dataFrame.fillNa(modeVal, { columns: [col], inplace: true });
                    break;
                case 'ffill':
                    forwardFill(dataFrame, col);
                    break;
                case 'bfill':
                    backwardFill(dataFrame, col);
                    break;
                default:
                    if (strategy.startsWith('constant:')) {
                        const constantValue = strategy.split(':')[1];
                        dataFrame.fillNa(constantValue, { columns: [col], inplace: true });
                    } else {
                        return {
                            content: [{ type: "text", text: `Error: Invalid strategy '${strategy}'.` }],
                            isError: true,
                        };
                    }
            }
        }
        const fileName = path.basename(filePath);
        const fileExt = path.extname(fileName); 
        const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const outputFileName = `${fileNameWithoutExt}_modified${fileExt}`;
        const outputFilePath = path.join(workDir, outputFileName);

        if (fileExt === '.csv') {
            const outputCsv = dfd.toCSV(dataFrame);
            if (!outputCsv) {
                throw new Error("Failed to generate CSV from DataFrame.");
            }
            fs.writeFileSync(outputFilePath, outputCsv);
        } else if (fileExt === '.xlsx') {
            dataFrame.toExcel({ filePath: outputFilePath });
        } else {
            throw new Error("Unsupported file format. Only .csv and .xlsx are supported.");
        }
        return {
            content: [{
                type: "text",
                text: `The modified file has been saved as: ${outputFileName}`,
            }],
            isError: false,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error handling null values:", error);

        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
}