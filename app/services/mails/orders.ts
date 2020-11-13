import { sendMail } from "./mailer";

const FROM = "no-reply@terradia.eu";

const receiveOrderEmail = (
  to: string,
  firstName: string,
  orderNumber: string,
  orderPrice: string,
  companyName: string
): void => {
  const receiveOrder = {
    to,
    from: FROM,
    subject: "Nous avons bien reçu votre commande ! - Terradia",
    templateId: "d-30abad69a4bc46f4a48c42910fccef6f",
    dynamic_template_data: {
      subject: "Nous avons bien reçu votre commande ! - Terradia",
      user_name: firstName,
      order_number : orderNumber,
      order_price : orderPrice,
      seller_company_name : companyName
    }
  };
  sendMail(receiveOrder);
};

export { receiveOrderEmail };
