# `npx graphcms-migrate`

EXPERIMENTAL

Needs migrating to the newer meow/ora with esm support, typescript.

## Usage

Run `npx graphcms-migrate --help` to get full usage instructions.

1. Add your `GRAPHCMS_ENDPOINT` and `GRAPHCMS_TOKEN` to `.env` (or use flags `--endpoint` and `--token`)
2. Add migrations to a directory called `graphcms-migrations`, or a name you prefer
3. Run and pass the directory name `npx graphcms-migrate <directory-of-migrations>`

```bash
Usage

  Step 1:
  Add migrations to /graphcms-migrations (or a custom directory)

  Step 2:
  Add your `GRAPHCMS_ENDPOINT` and `GRAPHCMS_TOKEN` to your root `.env` file

  Step 3:
  $ npx graphcms-migrate <directory> [options]

Examples

  Perform migrations in default `graphcms-migrations` directory:
  $ npx graphcms-migrate

  Perform migrations in custom migrations directory:
  $ npx graphcms-migrate my-migrations

  Provide a custom endpoint:
  $ npx graphcms-migrate -e GRAPHCMS_ENDPOINT

  Provide a custom token:
  $ npx graphcms-migrate -t GRAPHCMS_TOKEN

  Run migrations in dry mode:
  $ npx graphcms-migrate --dry-run

  Drop existing remote migration entries:
  $ npx graphcms-migrate --drop-migrations

Options

  --endpoint, -e    GraphCMS endpoint with environment
  --token,    -t    GraphCMS token with content + management permissions
  --dry-run,  -d    Don't actually run migrations, just print them
  --drop-migrations Drop existing remote migration content entries
```

## Migration template

You must create migration `.js` files inside your custom migrations directory formatted like this:

```js
const { FieldType, newMigration } = require("@graphcms/management");

const migration = newMigration({
  endpoint: process.env.GRAPHCMS_ENDPOINT,
  authToken: process.env.GRAPHCMS_TOKEN,
});

const instructor = migration.createModel({
  apiId: "Instructor",
  apiIdPlural: "Instructors",
  displayName: "Instructor",
});

instructor.addSimpleField({
  apiId: "name",
  displayName: "Name",
  type: FieldType.String,
  isRequired: true,
  isTitle: true,
});

instructor.addRelationalField({
  apiId: "avatar",
  displayName: "Avatar",
  model: "Asset",
});

module.exports = migration;
```

In an upcoming version we will pass the `endpoint`/`token` to `newMigration`, so this would remove the need for:

```js
const migration = newMigration({
  endpoint: process.env.GRAPHCMS_ENDPOINT,
  authToken: process.env.GRAPHCMS_TOKEN,
});
```

## GitHub Workflow

```yml
name: GraphCMS Migrations
on:
  push:
    branches:
      - main
jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "14"
          check-latest: true

      - name: Push schema
        run: npx graphcms-migrate
        env:
          GRAPHCMS_ENDPOINT: ${{ secrets.GRAPHCMS_ENDPOINT }}
          GRAPHCMS_TOKEN: ${{ secrets.GRAPHCMS_TOKEN }}
```
