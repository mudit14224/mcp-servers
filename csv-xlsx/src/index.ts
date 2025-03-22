// Imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js"
import * as XLSX from 'xlsx';
import * as fs from 'fs'; 
import * as path from 'path';
import { readFileSync } from 'fs';
import Papa from 'papaparse';
import { createCanvas } from 'canvas';
import * as dfd from 'danfojs-node';
import { Chart, ChartItem, registerables } from 'chart.js';
import { Series } from "danfojs-node/dist/danfojs-base/index.js";

Chart.register(...registerables); 


// Response Types
type ToolResponseType = {
    content: [{
        type: string,
        text: string
    }], 
    isError: boolean
}


// Define the tools
const WORK_DIR_TOOL: Tool = {
    name: "work_dir",
    description: "Get the current working directory set by the user",
    inputSchema: {
        type: "object",
        properties: {}
    }
}

const SET_WORK_DIR_TOOL: Tool = {
    name: "set_work_dir", 
    description: "Set the working directory", 
    inputSchema: {
        type: "object",
        properties: {
            newWorkDir: {
                type: "string", 
                description: "The new work dir path"
            }
        },
        required: ["newWorkDir"]
    }
}

const READ_FILE_TOOL: Tool = {
    name: "read_file",
    description: "Read the file from the given path",
    inputSchema: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "The path of the file to read"
            }
        },
        required: ["filePath"]
    }
}

const PLOT_GRAPH_TOOL: Tool = {
    name: "plot_graph",
    description: "Plot a simple graph for a file",
    inputSchema: {
        type: "object", 
        properties: {
            filePath: {
                type: "string",
                description: "The path of the file from which we get the data"
            },
            graphType: {
                type: "string",
                description: "The type of graph you want to plot using chart.js",
                enum: [
                    "line",
                    "bar",
                    "pie",
                    "doughnut",
                    "radar",
                    "scatter",
                    "polarArea",
                    "bubble",
                ],
            },
            xColumn: {
                type: "string"
            },
            yColumn: {
                type: "string"
            },
            outputFileName: {
                type: "string",
                description: "Name of the output image graph file"
            }
        },
        required: ["filePath", "graphType", "xColumn", "outputFileName"]
    }
}

const DESCRIBE_DATA_TOOL: Tool = {
    name: "describe_data",
    description: "Describe the data of the file using danfojs",
    inputSchema: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "The path of the file for which we want to describe the data"
            }
        },
        required: ["filePath"]
    }
}



// Functions
function getWorkDir(): string {
    const workDir = process.env.WORK_DIR;
    if (!workDir) {
        console.error("Cannot find WORK_DIR")
        process.exit(1);
    }
    return workDir
}

// handler functions
// get the workDir
async function sendWorkDir(): Promise<ToolResponseType> {
    try {
        const workDir = process.env.WORK_DIR;

        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }

        return {
            content: [{
                type: "text",
                text: workDir
            }],
            isError: false
        };
    } catch (error) {
        let errorMessage = "An error occurred while retrieving the work directory.";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.error("Error retrieving work directory:", error);

        return {
            content: [{
                type: "text",
                text: `Error retrieving work directory: ${errorMessage}`
            }],
            isError: true
        };
    }
}

// Set the work dir
async function setWorkDir(newWorkDir: string): Promise<ToolResponseType> {
    try {
        if (!newWorkDir) {
            throw new Error("New work directory cannot be empty.");
        }

        process.env.WORK_DIR = newWorkDir;

        return {
            content: [{
                type: "text",
                text: `Work Dir Env variable has been set to: ${newWorkDir}`
            }],
            isError: false
        };
    } catch (error) {
        let errorMessage = "An error occurred while setting the work directory.";

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.error("Error setting work directory:", error); // Log the error

        return {
            content: [{
                type: "text",
                text: `Error setting work directory: ${errorMessage}`
            }],
            isError: true
        };
    }
}

// Read the file
async function readFile(filePath: string) {
    try {
        // Load the workDir
        const workDir = process.env.WORK_DIR 

        if (!workDir) {
            throw new Error("Cannot find WORK_DIR environment variable.");
        }

        filePath = workDir + "/" + filePath

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at: ${filePath}`)
        }

        // Read the file as a buffer
        const fileBuffer = await fs.promises.readFile(filePath)
        const workbook = XLSX.read(fileBuffer, {type: "buffer"})

        // Get the first sheet 
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // Convert to Json
        const data = XLSX.utils.sheet_to_json(sheet)

        return { 
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }],
            isError: false
        }
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

// Helper function for reading Data
function readData(filePath: string): any[] {
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

// Plot the graph function
async function plotGraph(
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

// function to convert XLSX to JSON
async function convertXlsxToJson(filePath: string): Promise<any[]> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

// Describe Data function
async function describeData(filePath: string): Promise<ToolResponseType> {
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
        const descriptions: { numerical?: any; nonNumerical?: any } = {};

        // Filter for numerical columns
        const numericalColumns = dataframe.dtypes
            .map((dtype, index) => ({ dtype, index }))
            .filter(({ dtype }) => dtype !== 'string')
            .map(({ index }) => dataframe.columns[index]);

        if (numericalColumns.length > 0) {
            const numericalDf = dataframe.loc( { columns: numericalColumns })
            descriptions['numerical'] = dfd.toJSON(numericalDf.describe())
        }
        
        // Filter for non-numerical columns
        const nonNumericalColumns = dataframe.columns.filter(col => !numericalColumns.includes(col));

        if (nonNumericalColumns.length > 0) {
            const summary: Record<string, any> = {}

            for (const col of nonNumericalColumns) {
                const series: dfd.Series = dataframe[col]
                const count = series.count()
                const uniqueValues = series.unique()
                const numUnique = uniqueValues.shape[0]
                const valueCounts = series.valueCounts()
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

// Define an immutable list of tools
const CSV_TOOLS = [
    WORK_DIR_TOOL,
    SET_WORK_DIR_TOOL,
    READ_FILE_TOOL,
    PLOT_GRAPH_TOOL, 
    DESCRIBE_DATA_TOOL, 
] as const

// Server Setup
const server = new Server(
    {
      name: "csv-xlsx",
      version: "0.1.0",
    }, {
      capabilities: {
        tools: {},
      },
    },
);

server.setRequestHandler(ListToolsRequestSchema, async() => {
    return {tools: CSV_TOOLS}; 
})


// Call tool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "work_dir") {
            return await sendWorkDir();
        }

        if (request.params.name === "set_work_dir") {
            const { newWorkDir } = request.params.arguments as { newWorkDir: string }
            return await setWorkDir(newWorkDir)
        }

        if (request.params.name === "read_file") {
            const { filePath } = request.params.arguments as { filePath: string }
            return await readFile(filePath)
        }

        if (request.params.name === "plot_graph") {
            const { filePath, graphType, xColumn, yColumn, outputFileName } = request.params.arguments as { filePath: string, graphType: string, xColumn: string, yColumn: string | null, outputFileName: string }
            return await plotGraph(filePath, graphType, xColumn, yColumn, outputFileName)
        }

        if (request.params.name == 'describe_data') {
            const { filePath } = request.params.arguments as { filePath: string }
            return await describeData(filePath)
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Unknown tool: ${request.params.name}`
                }
            ],
            isError: true
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                }
            ],
            isError: true
        };
    }
});


// Define the run Server 
async function runServer() {
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("csv-xlsx MCP Server running on stdio");
}

// Run the Server
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});