#!/usr/bin/python

from dbCleaner import make_conn, fetch_data


def handler(event, context):
    result = []
    try:
        query_cmd = "delete from public.\"Companies\" where public.\"Companies\".\"archivedAt\" < NOW() - interval '1 minutes'"
        print(query_cmd)

        # get a connection, if a connect cannot be made an exception will be raised here
        conn = make_conn()

        fetch_data(conn, query_cmd)
        conn.close()
    except:
        print("error")
        return []
    return result
