## Getting Started
To start using Dependency bot is very easy with these simple installation steps:
* `git clone https://github.com/ashevchenko0309/dependency-bot.git`
* `npm install`
* `npm start`
* Enjoy

## Pre-requiste

- Node.js v18.x
- Typescript
- Bitbucket Access Token (https://support.atlassian.com/bitbucket-cloud/docs/create-a-repository-access-token/)
- Bitbucket Workspace
- Bitbucket repository

### Libraries

- TypeScript
- winston (logging)
- inquirer, loading-cli (CLI tools)

### TODO Features:
- update packages like `@orgname/*`, find all packages with this prefix and update them
- `--all` flag - when user provide `--all` flag, util can find updates for all packages. Handy for updates of all versions after release
- Several options for different functionality like:
  - find all updates and just output difference
  - output release notes for updates
- colorize difference of versions
  - red - breaking changes
  - yellow - major changes
  - green - minor/chore changes
- Fetch private npm packages
- Global config. Save configuration of previous settings and give opportunity to select one of selected.
- Different VCS support: github, gitlab
- Prettify logs
