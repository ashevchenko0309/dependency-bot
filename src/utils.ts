import {promises as fsPromises} from "fs";
import Logger from "./lib/logger";
import {RmOptions} from "node:fs";

export const isFolderExists = async (folderPath: string) => {
    try {
        const stats = await fsPromises.stat(folderPath);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Folder doesn't exist
            return false;
        }
        // Other error occurred
        throw error;
    }
}

export const removeFolder = async (name: string, options: RmOptions = {recursive: true, force: true}) => {
    if (await isFolderExists(name)) {
        Logger.info(`[Util]: Removing folder ${name}`)
        await fsPromises.rm(name, options)
    }
}

export const kill = (message?: string) => {
    if (message) {
        Logger.info(`Process killed with message: ${message}`);
    }

    process.exit(1);
}
