import {VERSION_SEPARATOR} from "../constants";
import {PackageVersionFinder} from "./package-version-finder";
import {kill} from "../utils";

export class DependenciesParser {
    private finder = new PackageVersionFinder();

    private getVersion = async (dependency: string) => {
        if (dependency.includes(VERSION_SEPARATOR)) {
            return dependency.split(VERSION_SEPARATOR);
        }

        const latestVersion = await this.finder.invoke(dependency);
        return [dependency, latestVersion]
    }

    parse = async (value: string): Promise<string[][]> => {
        const dependencies = value.split(' ');
        const packages = [];

        try {
            for (const dependency of dependencies) {
                packages.push(await this.getVersion(dependency));
            }

            return packages;
        } catch (error) {
            return kill(`[DependenciesParser]: parse failed with error ${error.message}`);
        }
    }
}
