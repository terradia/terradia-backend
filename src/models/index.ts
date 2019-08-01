import { Sequelize } from "sequelize-typescript";
import config from "../config";

const env = process.env.NODE_ENV || "development";
const currentConfig = config[env];

let sequelize: Sequelize;
try {
    sequelize = new Sequelize({
        ...currentConfig,
        models: [__dirname + "/**/*.model.ts"],
        modelMatch: (filename, member) => {
            return (
                filename.substring(0, filename.indexOf(".model")) ===
                member.toLowerCase()
            );
        }
    });
} catch (error) {
    console.log(error);
}

export default sequelize;
