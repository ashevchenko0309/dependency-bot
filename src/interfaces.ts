export interface RepositoryResponse {
    values: {
        full_name: string;
        links: {
            [p: string]: string | { name: string, href: string }[];
        }
    }[]
}

export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}
