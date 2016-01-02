"use strict";
var audit = require("./auditLogs");
var tokens = require("./tokens");
var user = require("./users");
var error = require("./error");
var permissions = require("./permissions");

module.exports = function(app) {


    /******************************************* Login related APIs *************************************************************************/
    /*
     * ## login to ACL panel
     * @param {String} email
     * @param {String} password
     * @param {Number} panel_id
     */
    app.post("/v1/acl/login", user.login, error);
    app.post("/v1/acl/login_new", user.login_new, error);
    /*
     * ##API for logging out from ACL pannel
     */
    app.post("/v1/acl/logout", tokens.logout, error);

    /*
     * ## Get API to verify if user is logged in
     * @param {String} token
     */
    app.get("/v1/acl/isloggedin", tokens.isLoggedInMiddleware, permissions.getPermissionsList, error);


    /*
     * ## Verify token and log requests
     *
     * @param {String} token - query param
     * @param {Number} panel_id
     * @param {Number} user_id
     * @param {String} api
     * @param {Number} reference_id
     * @param {String} request
     */
    app.post("/v1/acl/authorizeandlog", tokens.isLoggedInMiddleware, audit.makeLogs, tokens.fulfillAuthorize ,error);

    /******************************************* APIs for users data ********************************************************************/
    /*
     * ##API for user registeration
     * @param {String} email
     * @param {String} password
     * @param {String} name
     * @param {Number} phone_number
     * @param {Boolean} is_infinite_TTL
     * @param {Boolean} status
     * @param {String} city
     */
    app.post("/v1/acl/user/add", tokens.isLoggedInMiddleware, user.add, error);

    /*
     * ##API for updating user details
     * @params {Number} id - user id
     * @param {String} - parameter to update
     */
    app.post("/v1/acl/user/edit", tokens.isLoggedInMiddleware, user.edit, error);

    /*
     * ##API to change password of user
     * @param {String} old_password
     * @param {String} email
     * @param {String} new_password
     */
    app.post("/v1/acl/user/passwordchange", tokens.isLoggedInMiddleware, user.changePassword, error);

    /*
     * ##API to change password from email
     * @param {String} recovery_token
     * @param {String} email
     * @param {String} password
     */
    app.post("/v1/acl/user/passwordreset", user.passwordReset, error);

    /*
     * ##API to get list of users
     * @param {String} user_id - user id
     * @param {String} email - email id for users
     * @param {String} offset - for pagination
     * @param {String} limit - for pagination
     * @param {String} columns - comma separated list of columns
     */
    app.get("/v1/acl/user/details", tokens.isLoggedInMiddleware, user.getUsers, error);


    /*
    * ##API to get list of users panel_id wise
    * @param {Number} panel_id
    */
    app.get("/v1/acl/user/list", tokens.isLoggedInMiddleware, user.list, error);

    /*
     * ##API to get list of list of permissions a user has
     * @param {Number} user_id
     */
    app.get("/v1/acl/user/:user_id/permissions", tokens.isLoggedInMiddleware, permissions.getPermissionsList, error);

    /*
     * ##API to update permissions 
     * @param {Number} user_id
     * @param {Array} permissions - array of permissions which need to be updated Sample - {id:13(permission_id), key: {city(col_name): "chandigarh"(value) }
     */
    app.post("/v1/acl/permissions/update", tokens.isLoggedInMiddleware, permissions.update, error);


    /*
     * ##API to send mail to the given user email for password reset
     * @param {String} user_email
     */
     app.post("/v1/acl/user/forgetPassword", user.forgetPassword, error);


    /*
    * ##API to change status of user to inactive and remove all tokens for the user
    * @param {Number} user_id
    * */
    app.post("/v1/acl/user/suspend", tokens.isLoggedInMiddleware, user.suspend, error);
}