# CSV-XLSX Tools for Model Context Protocol (MCP)

This repository provides a set of tools designed to integrate seamlessly with the Model Context Protocol (MCP), facilitating interactions between AI applications and data sources. These tools enable functionalities such as retrieving and setting the working directory, reading data from CSV and XLSX files, and plotting graphs based on the data. I am actively developing additional tools to enhance functionality.

## Available Tools

### 1. `work_dir`
**Description**: Retrieves the current working directory set by the user within the MCP environment.
- **Usage**: Invoking this tool returns the current working directory configured in the environment, aiding in file path resolutions and data management.

### 2. `set_work_dir`
**Description**: Sets the working directory for subsequent operations within the MCP framework.
- **Input**: 
    - `newWorkDir`: A string specifying the new directory path to set as the working directory.
- **Usage**: This tool updates the working directory for the session, ensuring that subsequent file operations reference the correct location.

### 3. `read_file`
**Description**: Reads the content of a specified CSV or XLSX file from the working directory.
- **Input**: 
    - `filePath`: A string representing the relative path of the file to read.
- **Usage**: This tool reads and returns the content of the specified file in JSON format for XLSX files and CSV format for CSV files, facilitating data processing within MCP applications.

### 4. `plot_graph`
**Description**: Generates a graph based on data from a CSV or XLSX file.
- **Input**:
    - `filePath`: A string representing the relative path of the file containing the data.
    - `graphType`: A string specifying the type of graph to plot (e.g., `line`, `bar`, `pie`, etc.).
    - `xColumn`: A string indicating the column name to use for the X-axis.
    - `yColumn`: A string indicating the column name to use for the Y-axis (optional; if not provided, the tool plots a single-variable graph).
    - `outputFileName`: A string specifying the name of the output image file to save the graph.
- **Usage**: This tool processes the specified file, extracts the relevant data, and generates a graph saved as an image file in the working directory. It supports various graph types, including line, bar, pie, and more.

### 5. `describeData`
**Description**: Provides a summary of both numerical and non-numerical columns in a CSV or XLSX file.

- **Input**:
  - `filePath`: A string representing the relative path to the CSV or XLSX file within the working directory.

- **Output**: 
  - Returns a structured summary in JSON format including:
    - **Numerical Columns**: Statistical metrics such as mean, standard deviation, min, max, and quartiles.
    - **Non-Numerical Columns**: 
      - Count of non-missing entries (`count`)
      - Number of unique values (`numUnique`)
      - A frequency distribution of categorical values sorted by count (`categoryValueCounts`)

- **Usage**:  This tool is useful for quickly understanding the structure and distribution of data within a file. It supports preprocessing steps like exploratory data analysis by distinguishing between numerical and categorical features.

### 6. `generateCorrelationMatrix`
**Description**: Computes the correlation matrix for numerical columns in a CSV or XLSX file and optionally generates a heatmap-style plot.

- **Input**:
  - `filePath`: A string representing the relative path to the CSV or XLSX file within the working directory.
  - `plot`: A boolean indicating whether to generate and save a visual correlation matrix plot (`true`) or return the correlation matrix as JSON (`false`).

- **Output**:
  - If `plot` is `false`: Returns the correlation matrix as a JSON object representing pairwise correlations between all numerical columns.
  - If `plot` is `true`: Saves a PNG heatmap of the correlation matrix to the `claude-graphs` folder in the working directory and returns the image filename.

- **Usage**:
  - Useful for identifying relationships and multicollinearity between numerical features.
  - Enables visual data exploration by generating a correlation heatmap plot.
  - Can support downstream tasks like feature selection and model diagnostics.

## Future Developments

I am actively working on expanding the toolset to include additional functionalities that enhance data processing and visualization capabilities within the MCP ecosystem. 

## Contributing

Contributions are welcome! If you have suggestions for new tools or improvements, please feel free to open an issue or submit a pull request. 
