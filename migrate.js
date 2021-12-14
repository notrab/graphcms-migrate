const ora = require("ora");

const isAbsoluteUrl = require("is-absolute-url");
const { createClient } = require("./utils/graphcms-client");
const {
  checkMigrationModelExists,
} = require("./utils/check-migration-model-exists");
const { deleteMigrationEntries } = require("./utils/delete-migration-entries");
const { createMigrationModel } = require("./utils/create-migration-model");
const { getCompletedMigrations } = require("./utils/get-completed-migrations");
const { getLocalMigrations } = require("./utils/get-local-migrations");
const { runMigration } = require("./utils/run-migration");

const migrate = async (directory = "graphcms-migrations", options) => {
  const { endpoint, token, dryRun, dropMigrations } = options;

  const spinner = ora("Checking configuration").start();

  if (!endpoint) {
    spinner.warn("No GraphCMS endpoint provided");
    process.exit();
  }

  if (endpoint && !isAbsoluteUrl(endpoint)) {
    spinner.warn("Invalid GraphCMS endpoint provided");
    process.exit();
  }

  if (!token) {
    spinner.warn("No GraphCMS token provided");
    process.exit();
  }

  const graphcmsClient = createClient({
    endpoint,
    token,
  });

  spinner.text = "Checking migration model exists";

  const migrationModelExists = await checkMigrationModelExists({
    graphcmsClient,
  });

  if (!migrationModelExists) {
    spinner.text = "Migration model missing. Creating it";

    try {
      if (!(await createMigrationModel({ endpoint, token }))) {
        spinner.stop("Migration model creation failed");
      }
    } catch (err) {
      spinner.stop("Migration model creation failed");
    }
  }

  if (dropMigrations) {
    try {
      const count = await deleteMigrationEntries({ graphcmsClient });

      spinner.succeed(`Dropped ${count} migration entries`);
      process.exit();
    } catch (err) {
      spinner.stop("Could not drop migrations");
    }
  }

  spinner.text = "Fetching existing migrations from project";
  const completedMigrations = await getCompletedMigrations({ graphcmsClient });

  spinner.text = "Fetching local migrations";
  const localMigrations = getLocalMigrations({ directory });

  spinner.text = "Fetching migrations not yet ran";
  const migrationsToRun = localMigrations.filter(
    (fileName) => !completedMigrations.includes(fileName)
  );

  const migrationCount = migrationsToRun.length;

  if (!migrationCount) {
    spinner.info("No migrations to run");
    process.exit();
  }

  spinner.succeed(`Detected ${migrationCount} pending migrations`);

  if (dryRun) {
    console.log("Dry mode enabled");
  }

  spinner.start("Running migrations");

  for (const fileName of migrationsToRun) {
    await runMigration({
      endpoint,
      token,
      directory,
      fileName,
      dryRun,
      graphcmsClient,
    });
  }

  if (!dryRun) {
    spinner.succeed(`Schema migration completed successfully`);
  } else {
    spinner.info(`Dry run completed successfully`);
  }
};

exports.migrate = migrate;
