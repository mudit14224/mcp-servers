import * as XLSX from 'xlsx';
import * as fs from 'fs'; 

// Read the file
export async function readFile(filePath: string) {
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