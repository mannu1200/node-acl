ACL
----

What is it ?
------------
NODE-ACL is an ACL system written in node.js to provide the functionality for authentication and authorization.

Installation Instructions
-------------------------
1. npm install (to install all package dependencies)
2. Create database acl and import the tables from resources/db/dump.sql
3. node app (`NODE_ENV=production node app` to run it on production)

How Does it work ?
------------------

		  Api call(Requires authentication/authrization)			Api call (authentication/authrization)
App/frontend panel------------------------------------------>  Your backend service 1  -------------------->  Node-acl server
App/frontend panel------------------------------------------>  Your backend service 2  -------------------->  Node-acl server


Mysql Tables used:
-----------------
tb_acl_permissions: List of permissions assiggned to users.
tb_acl_tokens: Table for storing loggedin tokens
tb_acl_users: Table for users creds       
tb_cities:
tb_levels:
tb_panel_audit: Table for storing historical data of every request.
tb_panels:    
tb_promotions:

APIs (API documentation is inside routes/index.js)
-------------
/v1/acl/login
1. Check wheater the user is already logged-in in the system (using req.cookies.token)
2. If it does terminate the call then and there, else validate the password and create a token.
3. Get the list of permissions of the user.

/v1/acl/logout
1. Get token from request body/ cookie
2. Remove it from tb_acl_tokens.

/v1/acl/isloggedin
1. Checks the presence of token and if it is non-expired!
2. Returns the list of permissions in case of loggedin.

/v1/acl/user/add
1. Check is user is logged in (token from req body, query string or cookie)
2. Create an entry in tb_acl_users.

/v1/acl/user/edit
* As the name suggests (Can not update password)

/v1/acl/user/forgetPassword
* Send a password recovery email to user with recovery token

/v1/acl/user/passwordreset
* When user forgot the password, expect recovery token

/v1/acl/user/passwordchange
* Update password, expect old and new password

/v1/acl/user/details
* Get details of user, you must logged-in

/v1/acl/user/list
* Get list of users

/v1/acl/user/:user_id/permissions
* Get list of permissions assigned to given user

/v1/acl/permissions/update

/v1/acl/user/suspend
* Deactivate the user profile

Add user 

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
* All 




s are mentioned inside routes/index
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
