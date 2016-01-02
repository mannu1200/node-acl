"use strict"

var async = require("async");
var crypto = require('crypto');
var ejs = require("ejs");
var fs = require("fs");
var md5 = require("md5");
var util = require("util");


var tokens = require("./tokens");
var app_config = require("../config/app_config");
var mailer = require("../lib/notification/mailer");
var model_constants = app_config.database_constants;
var user_model = require("../model/users");
var tokens_model = require("../model/tokens");
var permissions = require("./permissions");
var constants   =   require('./constants');

function varifyParamsForInsert(data) {
    //Sanity for correct email type and phone number
    var mandetory_params = ["name", "email", "password", "status"];
    var flag = mandetory_params.every(function(param) {
        return (data[param] == undefined ? false : true);
    });
    return flag;
}

function getRecoveryToken(cb) {
    var recoveryToken = crypto.pseudoRandomBytes(32).toString('hex');
    var opts = {
            columns: ["id"],
            conditions: {
                "recovery_token": recoveryToken
            }
        },
        e = null;
    user_model.select(opts, function(err, result) {
        if (err) {
            util.log(err);
            e = new Error("Internal server error");
            e.status = 500;
            return cb(e);
        }
        if (result.length) { //token created allready is in use
            return getRecoveryToken(cb);
        }
        cb(null, recoveryToken);
    });


}

var user = {
    add: function(req, res, next) {
        var body = req.body,
            data = {},
            e = null;

        ["name", "email", "password", "phone_number", "is_infinite_TTL", "city", "status"].forEach(function(k) {
            if (body[k])
                data[k] = body[k];
        });

        if (!varifyParamsForInsert(data)) {
            var e = new Error("Mandetory params missings!");
            e.status = 400;
            return next(e);
        }
        data.password = md5.digest_s(data.password);

        //check if email id allready exist
        user_model.select({
            conditions: {
                email: data.email
            }
        }, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server Error!");
                e.status = 500;
                return next(e);
            }
            if (result.length) {
                e = new Error("Email ID allready in use!");
                e.status = 409;
                return next(e);
            }
            user_model.insert(data, function(err) {
                if (err) {
                    util.log(err);
                    var e = new Error("Internal server error!");
                    e.status = 500;
                    return next(e);
                }
                res.json({
                    "message": "done"
                });
            });
        });
    },

    edit: function(req, res, next) {
        var body = req.body;
        var id = body.id,
            data = {},
            e = null;

        //TODO need to find better way
        delete body.password; //password updation not allowed in this API
        delete body.id; //ID updation not allowed at all
        delete body.token;

        if (!id) {
            e = new Error("User ID required!");
            e.status = 400;
            return next(e);
        }

        Object.keys(body).forEach(function(k) {
            if (body[k] || body[k] == 0)
                data[k] = body[k];
        });

        //TODO do it in single query
        //check if user exits 
        user_model.select({
            conditions: {
                id: id
            }
        }, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server Error!");
                e.status = 500;
                return next(e);
            }

            if (!result.length) {
                e = new Error("User done not exist!");
                e.status = 400;
                return next(e);
            }

            user_model.update(data, id, function(err, result) {
                if (err) {
                    util.log(err);
                    e = new Error("Internal server error!");
                    e.status = 500;
                    return next(e);
                }

                res.json({
                    "message": "done"
                });
            });
        });
    },

    changePassword: function(req, res, next) {
        var old_password = md5.digest_s(req.body.old_password),
            new_password = md5.digest_s(req.body.new_password),
            email = req.body.email,
            stored_password = null,
            user_id = null,
            e = null;

        //TODO do it in single query
        //Validating old password first
        user_model.select({
            columns: ["id", "password"],
            conditions: {
                email: email
            }
        }, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server Error!");
                e.status = 500;
                return next(e);
            }
            if (!result.length || result[0].password != old_password) {
                e = new Error("Wrong Email Id or password");
                e.status = 400;
                return next(e);
            }
            user_id = result[0].id;
            user_model.update({
                password: new_password
            }, user_id, function(err) {
                if (err) {
                    util.log(err);
                    e = new Error("Internal server Error!");
                    e.status = 500;
                    return next(e);
                }
                res.json({
                    "message": "done"
                });
            });
        });
    },


    login: function(req, res, next) {
        var body = req.body;
        var email = body.email,
            password = md5.digest_s(body.password),
            e = null,
            TTL = (body.TTL == undefined ? null : TTL),
            user_id = null,
            is_infinite_TTL = null,
            token = null;

        if (req.cookies) {
            token = req.cookies.token;
        }

        //check if token allready exist
        tokens.isLoggedIn(token, function(err) {
            if (err) {
                //not all ready logged in
                user_model.select({
                    columns: ["password", "status", "id", "is_infinite_TTL"],
                    conditions: {
                        email: email
                    }
                }, function(err, result) {
                    if (err) {
                        util.log(err);
                        e = new Error("Internal server error");
                        e.status = 500;
                        return next(e);
                    }
                    if (!result.length) {
                        e = new Error("User does not exist!");
                        e.status = 400;
                        return next(e);
                    }
                    if (result[0].password != password) {
                        e = new Error("Wrong email/password!");
                        e.status = 401;
                        return next(e);
                    }

                    if (result[0].status != "ACTIVE") {
                        e = new Error("User is INACTIVE, please verify with Admin!");
                        e.status = 401;
                        return next(e);
                    }
                    var opts = {
                        "user_id": result[0].id,
                        "is_infinite_TTL": result[0].is_infinite_TTL,
                        "TTL": TTL
                    };
                    tokens.createToken(opts, function(err, a_token) {
                        if (err) {
                            util.log(err);
                            e = new Error("Internal server error!");
                            e.status = 500;
                            return next(e);
                        }
                        permissions.getPermissionsListHelper(opts.user_id, function(err, prms) {
                            if (err) {
                                util.log(err);
                                e = new Error("Internal server error!");
                                e.status = 500;
                                return next(e);
                            }
                            res.cookie("token", a_token, app_config.cookie_header);
                            res.json({
                                "message": "done",
                                "cookie": a_token,
                                "permissions": prms
                            });
                        });
                    });
                });
            } else {
                //allready logged in
                res.json({
                    "message": "Allready loggedin"
                });
            }
        });
    },

    login_new: function(req, res, next) {
        var body = req.body;
        var email = body.email,
            google_verified = body.google_verified,
            password = body.password,
            e = null,
            TTL = (body.TTL == undefined ? null : TTL),
            user_id = null,
            is_infinite_TTL = null,
            token = null;

        if (req.cookies) {
            token = req.cookies.token;
        }

        if(!google_verified) {
            e = new Error("Unverified User.");
            e.status = 401;
            return next(e);
        }

        if(password != constants.ACL_PASSWORD) {
            e = new Error("Unverified connection.");
            e.status = 401;
            return next(e);
        }

        //check if token allready exist
        tokens.isLoggedIn(token, function(err) {
            if (err) {
                //not allready logged in
                user_model.select({
                    columns: ["status", "id", "is_infinite_TTL"],
                    conditions: {
                        email: email
                    }
                }, function(err, result) {
                    if (err) {
                        util.log(err);
                        e = new Error("Internal server error");
                        e.status = 500;
                        return next(e);
                    }
                    if (!result.length) {
                        e = new Error("User does not exist!");
                        e.status = 400;
                        return next(e);
                    }

                    if (result[0].status != "ACTIVE") {
                        e = new Error("User is INACTIVE, please verify with Admin!");
                        e.status = 401;
                        return next(e);
                    }
                    var opts = {
                        "user_id": result[0].id,
                        "is_infinite_TTL": result[0].is_infinite_TTL,
                        "TTL": TTL
                    };
                    tokens.createToken(opts, function(err, a_token) {
                        if (err) {
                            util.log(err);
                            e = new Error("Internal server error!");
                            e.status = 500;
                            return next(e);
                        }
                        permissions.getPermissionsListHelper(opts.user_id, function(err, prms) {
                            if (err) {
                                util.log(err);
                                e = new Error("Internal server error!");
                                e.status = 500;
                                return next(e);
                            }
                            res.cookie("token", a_token, app_config.cookie_header);
                            res.json({
                                "message"       : "done",
                                "email"         : email,
                                "cookie"        : a_token,
                                "permissions"   : prms
                            });
                        });
                    });
                });
            } else {
                //allready logged in
                res.json({
                    "message": "Allready loggedin"
                });
            }
        });
    },

    getUsers: function(req, res, next) {
        var qparam = req.query;
        var email = qparam.email,
            id = qparam.user_id,
            limit = qparam.limit,
            offset = qparam.offset,
            conditions = {},
            e = null,
            columns = qparam.columns ? qparam.columns.split(",") : undefined,
            opts = {};

        //input validation
        if (!email && !id && !(limit || offset)) {
            e = new Error("Mandetory params required!");
            e.status = 400;
            return next(e);
        }


        if (id) {
            conditions.id = id;
        } else if (email) {
            conditions.email = email;
        } else {
            opts = {
                offset: offset,
                limit: limit
            }
        }

        if (columns) {
            opts.columns = columns;
        }
        opts.conditions = Object.keys(conditions).length ? conditions : undefined;

        user_model.select(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server error!");
                e.status = 500;
                return next(e);
            }
            res.json({
                "data": result
            });
        });
    },

    list: function(req, res, next) {
        var qparam = req.query,
            e = null;

        var opts = {
            columns: ["name","level_id","user_id","email","role"],
            conditions: {
                "panel_id": qparam.panel_id
            }
        };
        user_model.permissionsJoin(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server error!");
                e.status = 500;
                return next(e);
            }
            res.json({
                "data": result
            });
        });
    },

    forgetPassword: function(req, res, next) {
        var user_email = req.body.user_email,
            e = null;

        if (!user_email) {
            e = new Error("Email ID required!");
            e.status = 400;
            return next(e);
        }
        var opts = {
            columns: ["id"],
            conditions: {
                "email": user_email
            }
        };
        user_model.select(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server Error!");
                e.status = 500;
                return next(e);
            }
            if (!result || !result.length) {
                var e = new Error("User with given email ID does not exist!");
                e.status = 400;
                return next(e);
            }
            getRecoveryToken(function(err, token) {
                if (err) {
                    util.log(err);
                    e = new Error("Internal server error!");
                    e.status = 500;
                    return next(e);
                }
                var dataToUpdate = {
                    "recovery_token": token
                };
                user_model.update(dataToUpdate, result[0].id, function(err, result) {
                    if (err) {
                        util.log(err);
                        e = new Error("Internal server error!");
                        e.status = 500;
                        return cb(e);
                    }
                    var url = app_config.email.forget_password_url + "?token=" + token;
                    var opts = {
                        "to": [{
                            email: user_email
                        }],
                        "subject": "Reset your password!",
                        "html": ejs.render(fs.readFileSync(__dirname + "/../resources/templates/reset_password.ejs").toString(), {
                            "user": user_email,
                            "url": url
                        })
                    };
                    mailer.send(opts);
                    res.json({
                        "Message": "Done"
                    });
                });
            });
        });
    },

    passwordReset: function(req, res, next) {
        var recovery_token = req.body.recovery_token,
            password = req.body.password && md5.digest_s(req.body.password),
            e = null;
        if ( !password || !recovery_token) {
            e = new Error("Mandetory params required!");
            e.status = 400;
            return next(e);
        }

        var opts = {
            columns: ["id", "recovery_token"],
            conditions: {
                "recovery_token": recovery_token
            }
        };
        user_model.select(opts, function(err, result) {
            if (err) {
                util.log(err);
                e = new Error("Internal server error!");
                e.status = 500;
                return next(e);
            }
            if (!result || !result.length || recovery_token != result[0].recovery_token) {
                e = new Error("User does not exist");
                e.status = 400;
                return next(e);
            }
            var opts = {
                "password": password
            };
            user_model.update(opts, result[0].id, function(err, result) {
                if (err) {
                    util.log(err);
                    e = new Error("Internal server Error!");
                    e.status = 500;
                    return next(e);
                }
                res.json({
                    "Message": "done"
                });
            });

        });
    },

    suspend: function(req, res, next) {
        var user_id = req.body.user_id,
            e = null;

        var data_to_update = {
            'status' : 'INACTIVE'
        }
        user_model.update(data_to_update ,user_id, function(err, result) {
            if(err) {
                util.log(err);
                e = new Error("Internal server error!");
                return next(e);
            }
            var conditions = {
                user_id : user_id
            };
            tokens_model.remove(conditions, function(err, result) {
                if(err) {
                    util.log(err);
                    e = new Error("Internal server error!");
                    e.status = 500;
                    return next(e);
                }
                return res.json({"Message":"Done"});
            });
        });
    }
};

module.exports = user;


//Test functions
(function() {
    if (require.main === module) {
        console.log("Testing");
    }
}());
