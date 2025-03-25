// Imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js"
import { CSV_TOOLS } from "./toolSchemas.js";
import { 
    describeData, 
    generateCorrelationMatrix,
    sendWorkDir,
    setWorkDir,
    readFile,
    plotGraph,
    handleNullValues
} from "./tools/index.js";

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

        if (request.params.name === 'describe_data') {
            const { filePath } = request.params.arguments as { filePath: string }
            return await describeData(filePath)
        }

        if (request.params.name === 'correlation_matrix')  {
            const { filePath, plot } = request.params.arguments as { filePath: string, plot: boolean | void }
            const effectivePlot = plot ?? false;
            return await generateCorrelationMatrix(filePath, effectivePlot)
        }

        if (request.params.name === 'handle_null_values') {
            const { filePath, strategy, columns } = request.params.arguments as { filePath: string, strategy: string, columns: string[] }
            return await handleNullValues(filePath, strategy, columns)
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