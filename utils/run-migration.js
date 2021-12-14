const path = require("path");
const ora = require("ora");

const { createMigrationEntry } = require("../utils/create-migration-entry");

const runMigration = async ({
  directory,
  fileName,
  dryRun,
  graphcmsClient,
}) => {
  const filePath = path.resolve(directory, fileName);
  const spinner = ora(`Running migration: ${fileName}`).start();

  try {
    const migration = await require(filePath);

    if (dryRun) {
      const changes = await migration.dryRun();
      spinner.info(`Changes will be accepted when not in dry run ${fileName}`);
      console.log(changes);
    }

    const { errors, name, id, status } = await migration.run(true);

    if (errors) {
      spinner.fail(`Could not process migration`);
      // console.log(errors);
      throw errors;
    } else {
      spinner.succeed(`Migration file ${fileName} ran successfully!`);

      // TODO: Better handling of unsuccessful migrations
      // If something goes wrong here, there will be a conflict of local/remote migrations

      spinner.text = `Saving migration: ${fileName} to GraphCMS`;

      // TODO: Move this above, and update entry when completed
      // TODO: Compare completed migrations only, not just entries
      await createMigrationEntry({ graphcmsClient, fileName });
    }
  } catch (err) {
    spinner.fail(`Could not process migration`);
    console.log(err);
    process.exit(1);
  }
};

exports.runMigration = runMigration;
