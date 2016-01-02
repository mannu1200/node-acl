"use strict";

var crypto = require('crypto');
var util = require("util");

var tokens_model = require("../model/tokens.js");
var db_constants = require("../config/app_config").database_constants;
var permissions  = require("./permissions");


function isTokenAlive(TTL, created_at) {
    var today = new Date();
    var token_expiry_date = new Date(created_at);
    token_expiry_date.setDate(token_expiry_date.getDate() + TTL);
    if (token_expiry_date >= today) {
        return true;
    } else {
        return false;
    }
}

function getTokenString(cb) {

    var token = crypto.pseudoRandomBytes(32).toString('hex');
    var opts = {
            columns: ["id"],
            conditions: {
                "token": token
            }
        },
        e = null;
    tokens_model.select(opts, function(err, result) {
        if (err) {
            util.log(err);
            e = new Error("Internal server error");
            e.status = 500;
            return cb(e);
        }
        if (result.length) { //token created allready is in use
            return getTokenString(cb);
        }
        cb(null, token);
    });

}

var tokens = {

    /*
     * ##function to create token
     * @param {Number} user_id
     * @param {Number} TTL - time to live of token , will be overriden if user has is_infinite_TTL ,and will be taken from configuration if not provided
     * @param {Boolean} is_infinite_TTL
     */
    createToken: function(data, cb) {
        var user_id = data.user_id,
            TTL = null,
            is_infinite_TTL = data.is_infinite_TTL;

        if (!user_id) {
            return cb("User ID is mandetory!");
        }

        if (is_infinite_TTL) {
            TTL = db_constants.tb_acl_tokens.infinite_TTL;
        } else if (TTL) {
            TTL = TTL
        } else {
            TTL = db_constants.tb_acl_tokens.default_TTL;
        }

        getTokenString(function(err, a_token) {
            if (err) {
                return cb(err);
            }
            var opts = {
                user_id: user_id,
                token: a_token,
                TTL: TTL
            };
            tokens_model.insert(opts, function(err, result) {
                cb(err, a_token);
            });
        });
    },

    //Middleware for checking if user is loggedin 
    isLoggedInMiddleware: function(req, res, next) {

        if(process.env.NODE_ENV == "local") {
            return next();
        }

        var token = req.cookies.token || req.query.token || req.body.token;
        tokens.isLoggedIn(token, function(err, user_id) {
            req.user_id = user_id;
            return next(err);
        });
    },

    //isLoggedIn and isLoggedInMiddleware are kept seprate so that other functions too can call isLoggedIn like user.login
    //Checks presence of token and if it is alive
    isLoggedIn: function(token, cb) {
        var opts = {
                conditions: {
                    "token": token
                },
                columns: ["user_id", "created_at", "TTL"]
            },
            e = null;

        if (!token) {
            e = new Error("User not logged in!");
            e.status = 401;
            return cb(e);
        }

        tokens_model.select(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server error!");
                e.status = 500;
                return cb(e);
            }
            if (!result.length || !isTokenAlive(result[0].TTL, result[0].created_at)) {
                e = new Error("User not logged in!");
                e.status = 401;
                return cb(e);
            }
            //User is logged in
            return cb(null, result[0].user_id);
        });
    },

    logout: function(req, res, next) {
        var token = req.cookies.token || req.body.token,
            e = null;
        var opts = {
            token: token
        };
        tokens_model.remove(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server error!");
                e.status = 500;
                return next(e);
            }
            res.clearCookie('token');
            res.json({"message":"done"});
        });
    },

    fulfillAuthorize: function(req, res, next) {
        var e = null,
            user_id = req.user_id;
        permissions.getPermissionsListHelper(user_id, function(err, permissions){
            if(err) {
                next(err);
            }
            res.json({
                "permissions": permissions,
                "user_id": user_id
            });
        });
    }
};

module.exports = tokens;



//Testing functions
(function() {
    if (require.main == module) {
        getTokenString(console.log);
    }
}());