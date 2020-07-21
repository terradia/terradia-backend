import { MailDataRequired } from "@sendgrid/helpers/classes/mail";

import sgMail from "@sendgrid/mail";

const sendMail = (msg: MailDataRequired): void => {
  if (!process.env.SENDGRID_API_KEY) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const response = sgMail.send(msg).then(result => {
    console.log(result);
  });
};

export { sendMail };
