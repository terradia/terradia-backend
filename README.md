![Logo terradia](https://lh3.googleusercontent.com/-lNyFr6uZKvH9DKEpZSowznpXG-Oa83EJ14Pq77OyfG2VK8lqm6np8NF_Yj1F6_UDxCYxsf20ddU "Terradia")
## Summary

## How to install the server

To handle all the installations, a makefile is provided to make easier the run any commands.

### Dockers of the Server

The server is composed of multiple dockers :

- Pgadmin
- PostgreSQL
- Apollo server

### Install & Run the Docker-Compose

- You will need to install all the dependencies to make the dockers work :


    # npm install

- First, build & run the docker-compose :

*This will run the docker and show the logs in the terminal and close the docker when you do a `Ctrl + C`.*

    # ~/.../terradia-backend > make up

- Or :

*This will build & run the dockers and let them run after the command is finished*

    # ~/.../terradia-backend > docker-compose -p terradia up -d

## Database

### Creation of the database

Simply, run this command :

    # ~/.../terradia-backend > npm run db:create

### Migrations

Migrations are the way to version all the updates of the database. The goal is to create new migrations everytime we want to update the schema of the database.

### Create the schema

Just run the following command :

    # ~/.../terradia-backend > npm run migrate:up

This will up all the migrations until the database is *up to date*.

### Update the schema

To update the schema of the database, we need to create a new migration using sequelize and a gently provided script inside the `package.json` file:

    # ~/.../terradia-backend > npm run migration:create [enter your migration name]

Once your new migration is created you can code the `up` & `down` functions (just look at the first migration created inside the repository).

- The `up` function is the function called when you up the migration, so you will create the new tables, enums, types, etc... inside this function
- The `down` function is called when you down the migration, inside this function, you will drop the tables you created in the `up` function and basically destroy when you created..

## Development

- #### Apollo Server

The Apollo Server is available at the url : `http://localhost:8000`

- #### Pgadmin

The Pgadmin url is : [http://localhost:5050]()

When you access this url, a connection will be needed to access pgadmin, here are the credentials :

**Email** : `pgadmin4@pgadmin.org`

**Password** : `admin`

- #### PostgreSQL

**Url** : `http://localhost:5432`
 
**Username** : `postgres`

**Password** : `postgres`

**Local database hostname at server creation:** `postgres`

*(it's the name of the PostgreSQL inside the docker-compose network, it is not `localhost`)*

## Start BackEnd

    make up (run the db and the admin)
    
    npm start (run the apollo server)
