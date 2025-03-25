import { ToolResponseType } from '../types.js';


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
export async function sendWorkDir(): Promise<ToolResponseType> {
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
export async function setWorkDir(newWorkDir: string): Promise<ToolResponseType> {
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
