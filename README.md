											   ACL
	  									-----------------

What is it ?
------------
NODE Acl is for authentication and authorization of internal users and to provide and manage permissions

Installation Instructions
-------------------------
1. npm install (to install all package dependencies)
2. Create database acl and import it from resources/db/dump.sql
3. node app (NODE_ENV=production node app for production)

Technologies Used
-----------------
* Express
* EJS for rendering frontend pages
* anydb-sql ORM
* md5 npm for hashing password

Code Structure
--------------
* All database intractions are done by model/ files
* Controller (Business logic) is inside routes/ files
* All APIs are mentioned inside routes/index
* Sagregation of model/controller files is done table wise
* All constants,database ENUMs are stored in config/app_config.js
* All linux configuration are stored in config/cfg/
* Database dump is stored in resources/db/ should be updated after every DDL command
* Test code is to be inside test/
* Javascripts,CSS,images,Landing pages are in public/ directory
* Custom library and common functions are inside lib/
* Self executing scripts and crons are inside bin/
* Frontend pages to be rendered are inside views/

Coding Practices Used
---------------------

Issues And Bugs
---------------
