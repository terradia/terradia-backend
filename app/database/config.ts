import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

export default {
  development: {
    username: "postgres",
    password: "postgres",
    database: "terradia_db",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres"
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
    // Essential line because of https://github.com/zeit/ncc/issues/345 and https://github.com/zeit/now-builders/issues/331
    dialectModule: pg
  }
};
