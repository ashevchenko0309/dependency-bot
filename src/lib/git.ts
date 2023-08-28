import {exec} from "child_process";
import Logger from "./logger";

export class GitCommand {
    invoke = async (command: string) => {
        return new Promise((resolve, reject) => {
            exec(command, async (error) => {
                if (error) {
                    Logger.error(`[GitCommand]: ${command} executed with error`, { error })
                    reject();
                    return;
                }

                resolve(true);
            });
        })
    }
}
