#!/usr/bin/env node
require("dotenv").config();

const meow = require("meow");
const chalk = require("chalk");
const updateNotifier = require("update-notifier");

const { migrate } = require("./migrate");

const cli = meow(
  `
  ${chalk.bold("Usage")}

    ${chalk.dim("Step 1:")}
    Add migrations to /graphcms-migrations (or a custom directory)

    ${chalk.dim("Step 2:")}
    Add your \`GRAPHCMS_ENDPOINT\` and \`GRAPHCMS_TOKEN\` to your root \`.env\` file

    ${chalk.dim("Step 3:")}
    ${chalk.dim("$")} npx graphcms-migrate <directory> [options]

  ${chalk.bold("Examples")}
  
    ${chalk.dim(
      "Perform migrations in default `graphcms-migrations` directory:"
    )}
    ${chalk.dim("$")} npx graphcms-migrate

    ${chalk.dim("Perform migrations in custom migrations directory:")}
    ${chalk.dim("$")} npx graphcms-migrate my-migrations
    
    ${chalk.dim("Provide a custom endpoint:")}
    ${chalk.dim("$")} npx graphcms-migrate -e GRAPHCMS_ENDPOINT
    
    ${chalk.dim("Provide a custom token:")}
    ${chalk.dim("$")} npx graphcms-migrate -t GRAPHCMS_TOKEN
    
    ${chalk.dim("Run migrations in dry mode:")}
    ${chalk.dim("$")} npx graphcms-migrate --dry-run
    
    ${chalk.dim("Drop existing remote migration entries:")}
    ${chalk.dim("$")} npx graphcms-migrate --drop-migrations

  ${chalk.bold("Options")}
    
    ${chalk.dim("--endpoint, -e")}    GraphCMS endpoint with environment
    ${chalk.dim(
      "--token,    -t"
    )}    GraphCMS token with content + management permissions
    ${chalk.dim(
      "--dry-run,  -d"
    )}    Don't actually run migrations, just print them
    ${chalk.dim(
      "--drop-migrations "
    )}Drop existing remote migration content entries
`,
  {
    flags: {
      endpoint: {
        type: "string",
        alias: "e",
        default: process.env.GRAPHCMS_ENDPOINT || "",
      },
      token: {
        type: "string",
        alias: "t",
        default: process.env.GRAPHCMS_TOKEN || "",
      },
      dryRun: {
        type: "boolean",
        alias: "d",
        default: false,
      },
      dropMigrations: {
        type: "boolean",
        default: false,
      },
    },
  }
);

updateNotifier({ pkg: cli.pkg }).notify();

migrate(cli.input[0], cli.flags);
