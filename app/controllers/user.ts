import express from "express";
import {createHandler} from "azure-function-express";
import jwt from "jsonwebtoken";
import UserModel from "../database/models/user.model";
import initSequelize from "../database/models";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser = require("body-parser");

const app = express();

initSequelize();

const noCache = (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
};

app.use(cors({
    origin: "*",
    credentials: true,
    methods: "GET"
}));

app.use(helmet());
app.use(noCache);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error(err.stack);
        res.status(err.status || 500).send({ message: err.message, error: err });
    }
);
const handler = createHandler(app);

const checkEmail = (req: express.Request, res: express.Response) => {
    jwt.verify(
      req.query.token,
      process.env.TOKEN_SECRET!,
      async (err: Error, decoded: any) => {
        if (err) {
          return res.status(400).json({
            type: "fail",
            message: "Le lien de confirmation n'est pas valide ou a expiré."
          });
        }
        if (decoded.type !== "checkEmail") {
          return res.status(400).json({
            type: "fail",
            message: "Tu fait des choses bizarres..."
          });
        }
        return UserModel.findByPk(decoded.id)
          .then((record: UserModel | null) => {
            if (!record) {
              console.log("!record");
              return res.status(400).json({
                type: "fail",
                message: "L'utilisateur n'a pas été trouvé"
              });
            }
            if (record.validated) {
              return res.status(400).json({
                type: "fail",
                message: "Tu as déjà confirmé ton mail"
              });
            }
            return record.update({ validated: true }).then(() => {
                return res.status(200).json({
                    type: "success",
                    message: "Ton adresse mail a bien été confirmée"
                });
            }).catch(() => {
                return res.status(500).json({
                    type: "error",
                    message: "error"
                })
            });
          });
      }
    )
};

app.get("*", checkEmail);


const startExpress = () => {
    console.log("init checkEmail");
};

startExpress();

export default handler;

