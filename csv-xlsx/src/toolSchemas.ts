import { Tool } from "@modelcontextprotocol/sdk/types.js";


export const WORK_DIR_TOOL: Tool = {
    name: "work_dir",
    description: "Get the current working directory set by the user",
    inputSchema: {
        type: "object",
        properties: {}
    }
}

export const SET_WORK_DIR_TOOL: Tool = {
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

export const READ_FILE_TOOL: Tool = {
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

export const PLOT_GRAPH_TOOL: Tool = {
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

export const DESCRIBE_DATA_TOOL: Tool = {
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

export const CORR_MATRIX: Tool = {
    name: "correlation_matrix", 
    description: "Get the correlation matrix of the numerical columns for a file",
    inputSchema: {
        type: "object", 
        properties: {
            filePath: {
                type: "string", 
                description: "The path of the file for which we want the correlation matrix"
            }, 
            plot: {
                type: "boolean",
                description: "Whether the user wants to save the correlation plot offline."
            }
        },
        required: ["filePath"]
    }
}

export const HANDLE_NULL_TOOL: Tool = {
    name: "handle_null_values",
    description: "Handle null values in a CSV file",
    inputSchema: {
        type: "object",
        properties: {
            filePath: {
                type: "string",
                description: "The path of the CSV file to process."
            },
            strategy: {
                oneOf: [
                    {
                        type: "string",
                        description: "The strategy to use for handling null values.",
                        enum: [
                            "remove",
                            "mean",
                            "median",
                            "mode",
                            "ffill",
                            "bfill",
                        ],
                    },
                    {
                        type: "string",
                        description: "A constant value to fill nulls with (e.g., 'constant:0').",
                        pattern: "^constant:\\d+(\\.\\d+)?$", 
                    },
                ],
            },
            columns: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "List of columns to apply the strategy to.",
            },
        },
        required: ["filePath", "strategy", "columns"],
    }
}

export const DROP_COLUMNS_TOOL: Tool = {
    name: "drop_columns",
    description: "Drop columns from a dataframe", 
    inputSchema: {
        type: "object", 
        properties: {
            filePath: {
                type: "string", 
                description: "The path of the file from which we want to drop the columns"
            }, 
            columns: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "List of columns to drop."
            },
        },
        required: ["filePath", "columns"]
    }
}

export const RENAME_COLUMNS_TOOL: Tool = {
    name: "rename_columns",
    description: "Rename columns in a dataframe",
    inputSchema: {
        type: "object", 
        properties: {
            filePath: {
                type: "string",
                description: "The path of the file from which we want to rename the columns"
            },
            columnMapping: {
                type: "object",
                description: "A mapping of old column names to new column names.",
                additionalProperties: {
                    type: "string"
                },
            },
        },
        required: ["filePath", "columnMapping"],
    }
}

export const SELECT_COLUMNS_TOOL: Tool = {
    name: "select_columns",
    description: "Select only the specified columns from the dataset.", 
    inputSchema: {
        type: "object", 
        properties: {
            filePath: {
                type: "string",
                description: "The path of the file from which we want to select the columns"
            },
            columns: {
                type: "array",
                items: {
                    type: "string"
                },
                description: "List of columns to select."
            },
        },
        required: ["filePath", "columns"]
    }
}

export const CSV_TOOLS = [
    WORK_DIR_TOOL,
    SET_WORK_DIR_TOOL,
    READ_FILE_TOOL,
    PLOT_GRAPH_TOOL,
    DESCRIBE_DATA_TOOL,
    CORR_MATRIX,
    HANDLE_NULL_TOOL,
    DROP_COLUMNS_TOOL,
    RENAME_COLUMNS_TOOL, 
    SELECT_COLUMNS_TOOL,
] as const;