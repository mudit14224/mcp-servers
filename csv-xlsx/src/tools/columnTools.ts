import * as dfd from 'danfojs-node';
import * as path from 'path';
import { readData } from './shared.js';
import { ToolResponseType } from '../types.js';
import { saveDataToFile } from './shared.js';
import * as fs from 'fs';


export async function dropColumns(filePath: string, columns: string[]): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR;
        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }

        const fullFilePath = path.join(workDir, filePath);
        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }

        const data = readData(fullFilePath); 
        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }

        const dataFrame = new dfd.DataFrame(data);
        const invalidColumns = columns.filter(col => !dataFrame.columns.includes(col)); 
        if (invalidColumns.length > 0) {
            return {
                content: [{
                    type: "text",
                    text: `Error: Columns not found: ${invalidColumns.join(', ')}`,
                }],
                isError: true,
            }
        }

        dataFrame.drop({"columns": columns, inplace: true});

        return await saveDataToFile(dataFrame, fullFilePath)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error handling null values:", error);

        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
}

export async function renameColumns(filePath: string, columnMapping: { [oldName: string]: string}): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR; 
        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }
        
        const fullFilePath = path.join(workDir, filePath);
        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }
        
        const data = readData(fullFilePath); 
        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }

        const dataFrame = new dfd.DataFrame(data)

        const invalidColumns = Object.keys(columnMapping).filter(oldName => !dataFrame.columns.includes(oldName))
        if (invalidColumns.length > 0) {
            return {
                content: [{
                    type: "text",
                    text: `Error: Columns not found: ${invalidColumns.join(', ')}`,
                }],
                isError: true,
            };
        }

        dataFrame.rename(columnMapping, { inplace: true })

        return await saveDataToFile(dataFrame, fullFilePath)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error occured while renaming columns:", error);

        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
}

export async function selectColumns(filePath: string, columns: string[]): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR;
        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }

        const fullFilePath = path.join(workDir, filePath);
        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`);
        }
        
        const data = readData(fullFilePath); 
        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }
        
        const dataFrame = new dfd.DataFrame(data)

        const invalidColumns = columns.filter(col => !dataFrame.columns.includes(col)); 
        if (invalidColumns.length > 0) {
            return {
                content: [{
                    type: "text",
                    text: `Error: Columns not found: ${invalidColumns.join(', ')}`,
                }],
                isError: true,
            };
        }

        const selectedDf = dataFrame.loc({ columns: columns });
        return await saveDataToFile(selectedDf, fullFilePath);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error occured while selecting columns:", error);

        return {
            content: [{ type: "text", text: `Error: ${errorMessage}` }],
            isError: true,
        };
    }
}