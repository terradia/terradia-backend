import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../database/models/user.model";
import { Request, Response } from "express";
import CustomerModel from "../database/models/customer.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-03-02"
});

declare interface DecodedPayload {
  type: string;
  id: string;
}

export default {
  defineUserAsCustomer: async (userId: string) => {
    const user = await UserModel.findByPk(userId);
    if (!user) return;
    await stripe.customers
      .create({
        email: user.email,
        phone: user.phone
      })
      .then(async (customer: { id: any }) => {
        await CustomerModel.findOrCreate({
          where: { userId },
          defaults: {
            userId,
            stripeId: customer.id
          }
        });
      });
  },
  checkEmail: (req: Request, res: Response, next: NextFunction) =>
    jwt.verify(
      req.query.token,
      process.env.TOKEN_SECRET!,
      async (err: Error, decoded: Partial<DecodedPayload>) => {
        if (err) {
          return res.status(400).json({
            type: "fail",
            message: "Le lien de confirmation n'est pas valide ou a expiré."
          });
        }
        if (decoded.type !== "check-email") {
          return res.status(400).json({
            type: "fail",
            message: "Tu fait des choses bizarres..."
          });
        }
        return UserModel.findByPk(decoded.id)
          .then(async record => {
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
            return record.update({ validated: true }).then(() => ({
              type: "success",
              message: "Ton adresse mail a bien été confirmée"
            }));
          })
          .catch(next);
      }
    )
};
