// const ElasticSearch = require("elasticsearch");
import ElasticSearch from "@elastic/elasticsearch";
/**
 * *** ElasticSearch *** client
 * @type {Client}
 */
const client = new ElasticSearch.Client({
  node: process.env.ELASTIC_HOST
});

export default client;
