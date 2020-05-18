import { sendMail } from "./mailer";

const FROM = "no-reply@terradia.eu";

const createEmailRegister = (
  to: string,
  validationLink: string,
  firstName: string
): void => {
  const msg = {
    to,
    from: FROM,
    subject: "Bienvenue sur Terradia",
    text:
      "Merci pour votre inscription sur Terradia. Afin de profiter pleinement de Terradia il ne vous reste plus qu'à valider votre compte en cliquant sur le lien ce-dessous",
    html:
      "<strong>Merci pour votre inscription sur Terradia. Afin de profiter pleinement de Terradia il ne vous reste plus qu'à valider votre compte en cliquant sur le lien ce-dessous</strong>",
    templateId: "d-abd4e647210243ad9b5b97e49031f72e",
    dynamic_template_data: {
      validation_link: validationLink,
      subject: "Bienvenue sur Terradia",
      first_name: firstName
    }
  };
  sendMail(msg);
};

export { createEmailRegister };
