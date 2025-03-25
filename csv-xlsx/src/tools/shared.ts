import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as fs from 'fs'; 
import * as dfd from 'danfojs-node';
import * as path from 'path';
import { ToolResponseType } from '../types.js';

// Helper function for reading Data
export function readData(filePath: string): any[] {
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    let data: any[] = [];

    if (fileExtension === 'xlsx') {
        const fileBuffer = readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(sheet);
    } else if (fileExtension === 'csv') {
        const fileContent = readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true });
        data = parsed.data;
    }
    return data;
}

// Helper functions for handle null values
export function forwardFill(df: dfd.DataFrame, col: string) {
    const colData = df[col].values
    let lastValid = null

    for (let i=0; i < colData.length; i++) {
        if (colData[i] !== null && colData[i] !== undefined && !Number.isNaN(colData[i])) {
            lastValid = colData[i]
        } else if (lastValid !== null) {
            colData[i] = lastValid
        }
    }
    df.addColumn(col, colData, { inplace: true });
}

export function backwardFill(df: dfd.DataFrame, col: string) {
    const colData = df[col].values;
    let nextValid = null;

    for (let i = colData.length - 1; i >= 0; i--) {
        if (colData[i] !== null && colData[i] !== undefined && !Number.isNaN(colData[i])) {
            nextValid = colData[i];
        } else if (nextValid !== null) {
            colData[i] = nextValid;
        }
    }

    df.addColumn(col, colData, { inplace: true });
}

// function to convert XLSX to JSON
export async function convertXlsxToJson(filePath: string): Promise<any[]> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

// Helper function to save dataframe to a file
export async function saveDataToFile(dataFrame: dfd.DataFrame, fullFilePath: string): Promise<ToolResponseType> {
    try {
        const fileName = path.basename(fullFilePath);
        const fileExt = path.extname(fileName);
        const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const outputFileName = `${fileNameWithoutExt}_modified${fileExt}`;
        const outputFilePath = path.join(path.dirname(fullFilePath), outputFileName); //Save to same directory

        if (fileExt === '.csv') {
            const outputCsv = dfd.toCSV(dataFrame);
            if (!outputCsv) {
                throw new Error("Failed to generate CSV from DataFrame.");
            }
            fs.writeFileSync(outputFilePath, outputCsv);
        } else if (fileExt === '.xlsx') {
            await dataFrame.toExcel({ filePath: outputFilePath }); //toExcel is async
        } else {
            throw new Error("Unsupported file format. Only .csv and .xlsx are supported.");
        }

        return {
            content: [{
                type: "text",
                text: `Data saved to ${outputFileName}`,
            }],
            isError: false,
        };
    } catch (error) {
        let errorMessage = "An error occurred while saving the data.";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.error("Error saving data:", error);

        return {
            content: [{
                type: "text",
                text: `Error: ${errorMessage}`,
            }],
            isError: true,
        };
    }
}