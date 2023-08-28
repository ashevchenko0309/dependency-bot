import {promises as fsPromises} from "fs";
import Logger from "./logger";
import {PackageJson} from "../interfaces";
import {kill} from "../utils";

export class DependencyUpdater {
    constructor(private path: string) {
    }

    read = async (): Promise<PackageJson> => {
        try {
            const packageFile = await fsPromises.readFile(this.path, 'utf8');
            return JSON.parse(packageFile);
        } catch (error) {
            return kill(`[PackageUpdater]: Error reading package.json: ${error.message}`);
        }
    }

    write = async (json: PackageJson): Promise<void> => {
        try {
            await fsPromises.writeFile(this.path, JSON.stringify(json, null, 2), 'utf8');
        } catch (error) {
            return kill(`[PackageUpdater]: Error writing package.json: ${error.message}`);
        }
    }

    private isVersionEquals = (prev: string, next: string) => {
        return prev === next;
    }

    private updatePackage = (json: PackageJson, name: string, version: string, install?: boolean) => {
        if (json.dependencies && json.dependencies[name]) {
            if(this.isVersionEquals(json.dependencies[name], version)) return false;
            Logger.info(`[PackageUpdater]: Updating package ${name} version: ${json.dependencies[name]} -> ${version}`);
            json.dependencies[name] = version;
            // TODO: return object with metadata
            return true;
        }

        if (json.devDependencies && json.devDependencies[name]) {
            if(this.isVersionEquals(json.devDependencies[name], version)) return false;
            Logger.info(`[PackageUpdater]: Updating dev package ${name} version: ${json.devDependencies[name]} -> ${version}`);
            json.devDependencies[name] = version;
            // TODO: return object with metadata
            return true;
        }

        if (json.peerDependencies && json.peerDependencies[name]) {
            if(this.isVersionEquals(json.peerDependencies[name], version)) return false;
            Logger.info(`[PackageUpdater]: Updated peer package ${name} version: ${json.peerDependencies[name]} -> ${version}`);
            json.peerDependencies[name] = version;
            // TODO: return object with metadata
            return true;
        }

        if (install && json.dependencies) {
            json.dependencies[name] = version;
            Logger.info(`[PackageUpdater]: Added "${name}" to dependencies.`);
            return true;
        }

        Logger.info(`[PackageUpdater]: Package "${name}" not found in dependencies/devDependencies/peerDependencies.`);
        // TODO: return object with metadata
        return false;
    }

    update = (json: PackageJson, dependencies: string[][], install?: boolean) => {
        const draft = JSON.parse(JSON.stringify(json));

        const updated = dependencies.map(([name, version]) => this.updatePackage(draft, name, version, install));

        return {
            json: draft,
            atLeastOneUpdated: updated.some((dep) => dep)
        };
    }
}
