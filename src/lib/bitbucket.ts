import Logger from "./logger";
import {RepositoryResponse} from "../interfaces";
import {kill} from "../utils";
import {GitCommand} from "./git";

export class BitbucketApi {
    constructor(private readonly accessToken: string) {
    }
    private invoke = async (url: string, options?: RequestInit) => {
        return await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                ...options?.headers
            },
        });
    }

    get = (url: string, options?: RequestInit) => {
        return this.invoke(url, {
            ...options,
            method: 'GET',
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${this.accessToken}`,
            }
        })
    }

    post = (url: string, options?: RequestInit) => {
        return this.invoke(url, {
            ...options,
            method: 'POST'
        })
    }
}

export class Bitbucket {
    private readonly workspace: string;
    private readonly repository: string;
    private bitbucketApi: BitbucketApi;
    private readonly git = new GitCommand();

    constructor(accessToken: string, workspace: string, repository: string) {
        this.workspace = workspace;
        this.repository = repository;
        this.bitbucketApi = new BitbucketApi(accessToken);
    }

    pull = async () => {
        try {
            const response = await this.bitbucketApi.get(`https://api.bitbucket.org/2.0/repositories/${this.workspace}`)
            const responseJSON = await response.json() as RepositoryResponse;
            const repository = responseJSON.values.find(({full_name}) => full_name === `${this.workspace}/${this.repository}`);

            if (!repository) {
                return kill('[Bitbucket]: Cannot find repository');
            }

            if (!repository.links.clone || !Array.isArray(repository.links.clone)) {
                return kill('[Bitbucket]: Cannot get clone options');
            }

            const cloneURL = repository.links.clone.find((link) => link.name === 'https')!.href;

            await this.git.invoke(`git clone ${cloneURL}`);
            await this.git.invoke(`cd ${this.repository} && git checkout master`)

            return this;
        } catch (error) {
            kill('[Bitbucket]: Cannot pull repository');
            return false;
        }
    }

    createBranch = async (name: string) => {
        await this.git.invoke(`cd ${this.repository} && git checkout -b ${name}`);
        return this;
    }

    add = async (files: string) => {
        await this.git.invoke(`cd ${this.repository} && git add ${files}`);
    }

    commit = async (message: string) => {
        await this.git.invoke(`cd ${this.repository} && git commit -m "${message}"`);
        return this;
    }

    push = async (branch: string) => {
        await this.git.invoke(`cd ${this.repository} && git push --set-upstream origin ${branch}`);
        return this;
    }

    createPullRequest = async ({sourceBranch, destinationBranch, description, title}: { title: string; destinationBranch: string; sourceBranch: string; description: string }) => {
        try {
            const response = await this.bitbucketApi.post(`https://api.bitbucket.org/2.0/repositories/${this.workspace}/${this.repository}/pullrequests`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    source: {branch: {name: sourceBranch}},
                    destination: {branch: {name: destinationBranch}}
                })
            });

            if (response.ok) {
                const responseData = await response.json();
                Logger.info('Pull request created:', responseData.links.html.href);
            } else {
                kill(`[Bitbucket]: Error creating pull request with status ${response.statusText}`)
            }
        } catch (error) {
            kill('[Bitbucket]: Cannot create a pull request')
        }
    }
}
