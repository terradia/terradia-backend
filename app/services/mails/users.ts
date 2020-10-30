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

const createEmailInvitation = (
  to: string,
  invitationId: string,
  user_name: string | undefined,
  from_user_name: string,
  companyName: string
): void => {
  const mail = {
    to,
    from: FROM,
    subject: "Invitation à collaborer sur Terradia",
    templateId: "d-b6a051e0874d4be4936718a039c4c195",
    dynamic_template_data: {
      subject: "Invitation à collaborer sur Terradia",
      accept_button_text:
        user_name !== undefined
          ? "Accepter"
          : "Créer un compte et accepter automatiquement",
      accept_link:
        user_name !== undefined
          ? `https://producteurs.terradia.eu/accept/${invitationId}`
          : `https://producteurs.terradia.eu/register?invitationCode=${invitationId}`,
      decline_button_text: "Refuser",
      decline_link: `https://producteurs.terradia.eu/decline/${invitationId}`,
      from_user_name,
      user_name: user_name ? user_name : "",
      company_name: companyName
    }
  };
  sendMail(mail);
};

const forgotPasswordEmail = (
  to: string,
  firstName: string,
  code: string
): void => {
  const passwordMail = {
    to,
    from: FROM,
    subject: "Code d'accès à Terradia",
    templateId: "d-7f05f91f4da4453794f4e4fc965f4dc0",
    dynamic_template_data: {
      subject: "Code d'accès à Terradia",
      user_name: firstName,
      code_change_mail: code
    }
  };
  sendMail(passwordMail);
};

const passwordEditEmail = (to: string, firstName: string): void => {
  const passwordEditMail = {
    to,
    from: FROM,
    subject: "Modification de votre mot de passe Terradia",
    templateId: "d-93395481f3374aa7a2fb2944c06102d6",
    dynamic_template_data: {
      subject: "Modification de votre mot de passe Terradia",
      user_name: firstName
    }
  };
  sendMail(passwordEditMail);
};

export {
  createEmailRegister,
  createEmailInvitation,
  forgotPasswordEmail,
  passwordEditEmail
};
