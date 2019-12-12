import dotenv from "dotenv";
import pg from "pg";
// @ts-ignore
delete pg.native;
import {Dialect} from "sequelize";

dotenv.config();

declare interface connexion {
  username?: string,
  password?: string,
  database?: string,
  host?: string,
  port?: number,
  dialect: Dialect,
  dialectModule?: object,
  logging?: boolean
  ssl?: boolean
}

declare interface connexions {
  [development: string]: connexion,
  production: connexion
}

const parseDbPort = () => {
  const port = process.env.DB_PORT;
  console.log("DB_PORT: " + port);
  if (port === undefined)
    return undefined;
  return +port;
};

const config: connexions = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "terradia_db",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
    ssl: true
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseDbPort(),
    dialect: "postgres",
    logging: false,
    // Essential line because of https://github.com/zeit/ncc/issues/345 and https://github.com/zeit/now-builders/issues/331
    dialectModule: pg,
    ssl: true
  }
};

export default config;
