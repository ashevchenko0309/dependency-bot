#!/usr/bin/env node

import {BITBUCKET_QUESTIONS, DEPENDENCIES_QUESTIONS, DEPENDENCY_BOT_BRANCH_PREFIX} from "./constants";
import {resolve, join} from 'path';
import Logger from "./lib/logger";
import {DependencyUpdater} from "./lib/dependency-updater";
import {DependenciesParser} from "./lib/dependency-parser";
import {Bitbucket} from "./lib/bitbucket";
import {kill, removeFolder} from "./utils";

const loadingCLI = require('loading-cli');
const inquirer = require("inquirer");

const dependencyParser = new DependenciesParser();

async function main() {
    const load = loadingCLI({
        "text": "Loading...",
        "color": "green",
        "interval": 100,
        "stream": process.stdout,
        "frames": ["◰", "◳", "◲", "◱"]
    })

    // Provide bitbucket settings
    const bitbucketAnswers = await inquirer.prompt(BITBUCKET_QUESTIONS);
    const bitbucket = new Bitbucket(bitbucketAnswers.token, bitbucketAnswers.workspace, bitbucketAnswers.repository);

    load.start();
    try {
        // Remove pulled earlier repository
        await removeFolder(bitbucketAnswers.repository)
    } catch (e) {
        kill(e)
    }

    // Pull project
    await bitbucket.pull();

    load.stop();
    // Provide dependencies questions
    const packageAnswers = await inquirer.prompt(DEPENDENCIES_QUESTIONS);
    const dependenciesAnswer = packageAnswers.dependencies;
    const installMissingDeps = packageAnswers.install;

    load.start();
    // Parse dependencies
    const dependencies = await dependencyParser.parse(dependenciesAnswer);

    // Update package json draft
    const packageUpdater = new DependencyUpdater(resolve(join(bitbucketAnswers.repository, 'package.json')));
    const packageJson = await packageUpdater.read();
    const {json, atLeastOneUpdated} = packageUpdater.update(packageJson, dependencies, installMissingDeps);

    if (atLeastOneUpdated) {
        // If someone was updated create a pull request
        const branchName = `${DEPENDENCY_BOT_BRANCH_PREFIX}${Date.now()}`;
        await bitbucket.createBranch(branchName);
        await packageUpdater.write(json);
        await bitbucket.add('.');
        await bitbucket.commit('[chore]: updated dependencies');
        await bitbucket.push(branchName);
        await bitbucket.createPullRequest({
            destinationBranch: 'master',
            sourceBranch: branchName,
            title: 'chore(DependencyBot): Updated dependencies',
            description: 'updated dependencies'
        });

        // Clean up folder
        await removeFolder(bitbucketAnswers.repository);
        Logger.info('[MAIN]: Done! Pull request created, exiting...')
    } else {
        Logger.info('[MAIN]: Nothing to update, exiting...');
    }

    load.stop();

    kill()
}

main().catch(error => {
    kill(`[MAIN]: Uncaught error ${error.message}`)
});
