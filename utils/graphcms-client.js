const { GraphQLClient } = require("graphql-request");

const createClient = ({ endpoint, token }) =>
  new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "npx graphcms-migrate",
    },
  });

exports.createClient = createClient;
