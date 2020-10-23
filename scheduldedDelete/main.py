#!/usr/bin/python

from dbCleaner import make_conn, fetch_data
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def handler(event, context):
    result = []
    try:
        query_cmd = "delete from public.\"Companies\" where public.\"Companies\".\"archivedAt\" < NOW() - interval '1 minutes'"
        print(query_cmd)

        # get a connection, if a connect cannot be made an exception will be raised here
        conn = make_conn()

        result = fetch_data(conn, query_cmd)
        # recup valeur retour fetch data si result != null alors suppression a eu lieu et il faut envoyer mail
        # si plusieurs entreprises supprimées => tout dans result
        # 3 = email ;
        # 2 = nom de la companie ;
        # 16 = siren ;
        if result:
            for item in result:
                message = Mail(
                    from_email = 'no-reply@terradia.eu',
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

        conn.close()
    except:
        print("error")
        return []
    return result
