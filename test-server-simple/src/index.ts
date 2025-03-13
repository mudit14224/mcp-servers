import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError
} from "@modelcontextprotocol/sdk/types.js"

const server = new Server({
    name: "mcp-server", 
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
}); 

server.setRequestHandler(ListToolsRequestSchema, async() => {
    return {tools: []}; 
})

const transport = new StdioServerTransport();
await server.connect(transport);

// Define and add tools here
// Simple addition tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [{
            name: "calculate_sum",
            description: "Add two numbers together",
            inputSchema: {
                type: "object", 
                properties: {
                    a: { type: "number" },
                    b: { type: "number" }
                },
                required: ["a", "b"]
            }
        }]
    };
}); 

// Request Handler for Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "calculate_sum") {
      const { a, b } = request.params.arguments as { [key: string]: number};
      return { toolResult: a + b };
    }
    throw new Error("Tool not found!"); 
  });