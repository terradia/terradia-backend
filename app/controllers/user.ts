import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../database/models/user.model";

export default {
  checkEmail: (req: Request, res: Response, next: NextFunction) =>
    jwt.verify(
      req.query.token,
      process.env.TOKEN_SECRET!,
      async (err: Error, decoded) => {
        if (err) {
          return res.status(400).body({
            type: "fail",
            message: "Le lien de confirmation n'est pas valide ou a expiré."
          });
        }
        if (decoded.type !== "check-email") {
          return res.status(400).body({
            type: "fail",
            message: "Tu fait des choses bizarres..."
          });
        }
        return UserModel.findByPk(decoded.id)
          .then(record => {
            if (!record) {
              console.log("!record");
              return res.status(400).body({
                type: "fail",
                message: "L'utilisateur n'a pas été trouvé"
              });
            }
            if (record.validated) {
              return res.status(400).body({
                type: "fail",
                message: "Tu as déjà confirmé ton mail"
              });
            }
            return record.update({ validated: true }).then(() => ({
              type: "success",
              message: "Ton adresse mail a bien été confirmée"
            }));
          })
          .catch(next);
      }
    )
};
