import Logger from "./logger";

const fetch = require("npm-registry-fetch");

export class PackageVersionFinder {
    invoke = async (name: string) => {
        try {
            const metadata = await fetch.json(`/${name}`, {});
            return metadata['dist-tags']['latest'];
        } catch (error) {
            Logger.error('[PackageVersionFinder]: Error fetching package information:', error);
            throw new Error(`Cannot get package version of package: ${name}`);
        }
    }
}
