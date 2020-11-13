import client from "./server";
// const i18nFile = require("./i18n/i18n");
//
// let abc = i18n.__("Hello");

client.ping(
  {
    requestTimeout: 30000
  },
  function(error: any) {
    error
      ? console.error("ElasticSearch cluster is down!")
      : console.log("ElasticSearch is ok");
  }
);
