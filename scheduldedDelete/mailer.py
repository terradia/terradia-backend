from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

sendingEmail = 'no-reply@terradia.eu'

def mailCompanyDelete(result):
    for item in result:
        message = Mail(
            from_email = sendingEmail,
            to_emails=item[3],
            subject='Suppression de votre entreprise sur Terradia')
        message.dynamic_template_data = {
            'subject': 'Suppression de votre entreprise sur Terradia',
            'companie_name': item[2],
            'companie_legal_number': item[16]
        }
        message.template_id = 'd-ff20036f3b36447a9c40039a226d0021'
            try:
                sendgrid_client = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
                response = sendgrid_client.send(message)
                print(response.status_code)
                print(response.body)
                print(response.headers)
            except Exception as e:
                print(e.message)

def deleteUserAccountMail(result):
    for item in result:
        message = Mail(
            from_email = sendingEmail,
            to_emails=item[3],
            subject='Suppression de votre compte Terradia')
        message.dynamic_template_data = {
            'subject': 'Suppression de votre compte Terradia',
            'user_name': item[1],
            'last_name': item[2]
        }
        message.template_id = 'd-d02cc57055ed4dba8c7ce898818611c7'
        try:
            sendgrid_client = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sendgrid_client.send(message)
            print(response.status_code)
            print(response.body)
            print(response.headers)
        except Exception as e:
            print(e.message)