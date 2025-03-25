import * as fs from 'fs';
import * as path from 'path';
import * as dfd from 'danfojs-node';
import { ToolResponseType } from '../types.js';
import { readData } from './shared.js';

export async function describeData(filePath: string): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR; 
        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable")
        }

        const fullFilePath = path.join(workDir, filePath)

        if (!fs.existsSync(fullFilePath)) {
            throw new Error(`File not found at: ${filePath}`)
        }

        const data = readData(fullFilePath); 

        if (!data || data.length === 0) {
            throw new Error("Failed to read data from file.");
        }

        const dataframe = new dfd.DataFrame(data);
        const descriptions: { numerical?: Record<string, any>; nonNumerical?: Record<string, any>; nullCounts?: Record<string, number> } = {};

        // Calculate Null counts for each column
        const nullCounts: Record<string, number> = {};
        for (const col of dataframe.columns) {
            const series = dataframe[col]
            let nullCount = 0

            for (const val of series.values) {
                if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
                    nullCount++;
                }
            }
            nullCounts[col] = nullCount
        }

        descriptions['nullCounts'] = nullCounts;

        // Filter for numerical columns
        const numericalColumns = dataframe.dtypes
            .map((dtype, index) => ({ dtype, index }))
            .filter(({ dtype }) => dtype !== 'string')
            .map(({ index }) => dataframe.columns[index]);

        if (numericalColumns.length > 0) {
            const numericalSummary: Record<string, any> = {};

            for (const col of numericalColumns) {
                const series = dataframe[col];
            
                // Filter out null/undefined/NaN
                const cleanedValues = series.values.filter((v: any) => 
                    v !== null && v !== undefined && !(typeof v === 'number' && isNaN(v)));
            
                // Skip if all values were null
                if (cleanedValues.length === 0) {
                    numericalSummary[col] = { message: 'All values are null or invalid' };
                    continue;
                }
            
                const cleanSeries = new dfd.Series(cleanedValues);
            
                numericalSummary[col] = {
                    count: cleanSeries.count(),
                    mean: cleanSeries.mean(),
                    std: cleanSeries.std(),
                    min: cleanSeries.min(),
                    max: cleanSeries.max(),
                    median: cleanSeries.median(),
                };
            }
            descriptions['numerical'] = numericalSummary;
        }
        
        // Filter for non-numerical columns
        const nonNumericalColumns = dataframe.columns.filter(col => !numericalColumns.includes(col));

        if (nonNumericalColumns.length > 0) {
            const summary: Record<string, any> = {}

            for (const col of nonNumericalColumns) {
                const series: dfd.Series = dataframe[col]
                // Filter out null values for clean stats
                const nonNullValues = series.values.filter(v => v !== null && v !== undefined && !(typeof v === 'number' && isNaN(v)));
                const cleanSeries = new dfd.Series(nonNullValues);
                const count = cleanSeries.count()
                const uniqueValues = cleanSeries.unique()
                const numUnique = uniqueValues.shape[0]
                const valueCounts = cleanSeries.valueCounts()
                const sortedValueCounts = valueCounts.sortValues( {ascending: false} )

                const categoryValueCounts: Record<string, number> = {}
                const index = sortedValueCounts.index
                const values = sortedValueCounts.values

                for (let i = 0; i < index.length; i++) {
                    categoryValueCounts[String(index[i])] = Number(values[i])
                }

                summary[col] = {
                    count,          // number of non-missing entries
                    numUnique,      // number of unique values
                    categoryValueCounts // categories sorted with count
                }
            }
            descriptions['nonNumerical'] = summary
        }
        return {
            content: [{
                type: "text",
                text: JSON.stringify(descriptions, null, 2),
            }],
            isError: false,
        };
    } catch (error) {
        let errorMessage = "An error occurred while describing the data.";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.error("Error describing data:", error);

        return {
            content: [{
                type: "text",
                text: `Error: ${errorMessage}`,
            }],
            isError: true,
        };
    }
}