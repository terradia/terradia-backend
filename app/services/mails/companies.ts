import { sendMail } from "./mailer";

const FROM = "no-reply@terradia.eu";

const archivedCompanieEmail = (
  to: string,
  companyName: string,
  userName: string
): void => {
  const archivedCompanie = {
    to,
    from: FROM,
    subject: "Votre entreprise est désormais archivée",
    templateId: "d-e3eaaef7bf8b482b8a21194557a48ba8",
    dynamic_template_data: {
      subject: "Votre entreprise est désormais archivée",
      user_name: userName,
      company_name: companyName
    }
  };
  sendMail(archivedCompanie);
};

const restoreCompanieEmail = (
  to: string,
  companyName: string,
  userName: string,
  lastName: string
): void => {
  const restoreCompanie = {
    to,
    from: FROM,
    subject: "Vous avez réactivé votre entreprise sur Terradia !",
    templateId: "d-b1c349c1fffd4d88abd0d033306955c7",
    dynamic_template_data: {
      subject: "Vous avez réactivé votre entreprise sur Terradia !",
      user_name: userName,
      last_name: lastName,
      company_name: companyName
    }
  };
  sendMail(restoreCompanie);
};

const newCollaboratorCompanyEmail = (
  to: string,
  companyName: string,
  userName: string,
  lastName: string
): void => {
  const newCollaboratorCompany = {
    to,
    from: FROM,
    subject: "Un nouveau collaborateur a rejoint votre entreprise sur Terradia",
    templateId: "d-281dad3868e14691abe3f471a8e61af9",
    dynamic_template_data: {
      subject:
        "Un nouveau collaborateur a rejoint votre entreprise sur Terradia",
      new_collaborator_fn: userName,
      new_collaborator_ln: lastName,
      company_name: companyName
    }
  };
  sendMail(newCollaboratorCompany);
};

export {
  archivedCompanieEmail,
  restoreCompanieEmail,
  newCollaboratorCompanyEmail
};
