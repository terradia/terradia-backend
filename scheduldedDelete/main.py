#!/usr/bin/python

from dbCleaner import make_conn, fetch_data
from mailer import mailCompanyDelete, deleteUserAccountMail

def handler(event, context):
    result = []
    result_users = []
    try:
        query_cmd = "delete from public.\"Companies\" where public.\"Companies\".\"archivedAt\" < NOW() - interval '1 minutes'"
        query_users = "delete from public.\"Users\" where public.\"Users\".\"archivedAt\" < NOW() - interval '1 minutes'"
        print(query_cmd)
        # get a connection, if a connect cannot be made an exception will be raised here
        conn = make_conn()
        result = fetch_data(conn, query_cmd)
        result_users = fetch_data(conn, query_cmd)
        if result:
            mailCompanyDelete(result)
        if result_users:
            deleteUserAccountMail(result_users)
        conn.close()
    except:
        print("error")
        return []
    return result
