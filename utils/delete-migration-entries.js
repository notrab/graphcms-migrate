const { gql } = require("graphql-request");

// Walk through pages in future
const DELETE_MIGRATION_ENTRIES_MUTATION = gql`
  mutation deleteMigrationEntries {
    deleteManyAssetsConnection {
      aggregate {
        count
      }
    }
  }
`;

const deleteMigrationEntries = async ({ graphcmsClient }) => {
  try {
    const { deleteManyAssetsConnection } = await graphcmsClient.request(
      DELETE_MIGRATION_ENTRIES_MUTATION
    );

    return deleteManyAssetsConnection.aggregate.count;
  } catch (err) {
    console.error(err.message || "Something went wrong");
    throw err;
  }
};

exports.deleteMigrationEntries = deleteMigrationEntries;
