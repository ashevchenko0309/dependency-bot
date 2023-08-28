export const VERSION_SEPARATOR = '@';

export const BITBUCKET_QUESTIONS = [
    {
        type: 'input',
        name: 'token',
        message: 'Enter a access token for bitbucket: ',
        validate: (input: string) => (Boolean(input) || 'Please provide access token'),
    },
    {
        type: 'input',
        name: 'workspace',
        message: 'Enter a workspace name for bitbucket: ',
        validate: (input: string) => (Boolean(input) || 'Please provide a workspace'),
    },
    {
        type: 'input',
        name: 'repository',
        message: 'Enter a repository name: ',
        validate: (input: string) => (Boolean(input) || 'Please provide a repository name'),
    },
]
export const DEPENDENCIES_QUESTIONS = [
    {
        type: 'input',
        name: 'dependencies',
        message: 'Enter a space-separated list of package names to update (example: lodash react@18.0.0):',
        validate: (input: string) => (input ? true : 'Please provide a list of package names.'),
    },
    {
        type: 'confirm',
        name: 'install',
        message: 'Install missing packages from the list?',
        default: false,
    },
];

export const DEPENDENCY_BOT_BRANCH_PREFIX = 'chore/dependency-bot-';
