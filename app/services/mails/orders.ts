import { sendMail } from "./mailer";

const FROM = "no-reply@terradia.eu";

const receiveOrderCustomerEmail = (
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
      order_number: orderNumber,
      order_price: orderPrice,
      seller_company_name: companyName
    }
  };
  sendMail(receiveOrder);
};

const receiveOrderCompanyEmail = (
  to: string,
  companyName: string,
  orderCode: string,
  orderPrice: string
): void => {
  const receiveOrderCompany = {
    to,
    from: FROM,
    subject: "Nouvelle commande sur Terradia",
    templateId: "d-533f33097e0f42c48ee6f48060bcd37d",
    dynamic_template_data: {
      subject: "Nouvelle commande sur Terradia",
      company_name: companyName,
      order_nb: orderCode,
      order_price: orderPrice
    }
  };
  sendMail(receiveOrderCompany);
};

const acceptedOrderCustomerEmail = (
  to: string,
  firstName: string,
  orderCode: string,
  companyName: string,
  orderPrice: string
): void => {
  const acceptedOrderCustomer = {
    to,
    from: FROM,
    subject: "Votre commande sur Terradia est acceptée",
    templateId: "d-214e3a2bae874407b002194f0279abd8",
    dynamic_template_data: {
      subject: "Votre commande sur Terradia est acceptée",
      user_name: firstName,
      order_nb: orderCode,
      company_name: companyName,
      order_price: orderPrice
    }
  };
  sendMail(acceptedOrderCustomer);
};

const refusedOrderCustomerEmail = (
  to: string,
  firstName: string,
  orderCode: string,
  orderPrice: string,
  companyName: string
): void => {
  const refusedOrderCustomer = {
    to,
    from: FROM,
    subject: "Votre commande sur Terradia est refusée",
    templateId: "d-a1e798b9c61b419a830083bd7d4b0cd9",
    dynamic_template_data: {
      subject: "Votre commande sur Terradia est refusée",
      user_name: firstName,
      order_nb: orderCode,
      order_price: orderPrice,
      company_name: companyName
    }
  };
  sendMail(refusedOrderCustomer);
};

export {
  receiveOrderCustomerEmail,
  receiveOrderCompanyEmail,
  acceptedOrderCustomerEmail,
  refusedOrderCustomerEmail
};
