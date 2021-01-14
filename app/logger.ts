import chalk, { Chalk } from "chalk";
import debug from "debug";

const divider: string = chalk.gray("-----------------------------------");

export default {
  error: (err: any) => {
    debug("app:server")(chalk.red(err));
  },

  appStarted: (port: number, host: string, graphQlPath?: string) => {
    const nodeEnv = process.env.NODE_ENV;
    debug("app:server")(`\tServer started ! 🚀`);
    debug("app:server")(
      `${chalk.bold("\tAccess URLs:")}
                      ${divider}
                      \tLocalhost :\t${chalk.magenta(`http://${host}:${port}`)}
                      \tGraphQL :\t${chalk.magenta(
                        `http://${host}:${port}${graphQlPath}`
                      )}
                      ${divider}
                      \t${chalk.blue(`Press ${chalk.italic("CTRL-C")} to stop`)}
                      ${divider}
                      \t${chalk.blue(
                        `Env: NODE_ENV=${nodeEnv ? nodeEnv : "N/A"}`
                      )}
                      ${nodeEnv && divider}
                      \t${chalk.blue(
                        `${nodeEnv !== "prod" &&
                          "Mailler is disabled because NODE_ENV is not set to prod"}`
                      )}`
    );
  }
};
