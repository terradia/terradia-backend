#!/usr/bin/python
import os
import psycopg2

def make_conn():
    conn = None
    try:
        print("connecting...")
        conn = psycopg2.connect(dbname=os.environ["db"], user=os.environ["user"], host=os.environ["host"], password=os.environ["password"])
    except:
        print("I am unable to connect to the database")
        exit(1)
    if conn is None:
        print("Unable to connect")
        exit(1)
    print("connection successful")
    return conn


def fetch_data(conn, query):
    result = []
    cursor = conn.cursor()
    cursor.execute(query)
    conn.commit()
    try:
        result = cursor.fetchone()
    except psycopg2.ProgrammingError:
        print("No row affected")
    return result
