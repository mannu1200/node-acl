"use strict";

var async = require("async");
var util = require("util");
var async = require("async");

var permissions_model = require("../model/permissions");

/*
 * @param {Array/Object} data
 */
function verifyForUpdation(data) {
    if (!data)
        return false;

    //So that not only array but objects too are supported by this function
    data = [].concat(data);

    var flag = data.every(function(row) {
        if (!row.id) {
            return false;
        }
        if (permissions_model.columns.indexOf(row.name) != -1) {
            if ((!row.value || isNaN(row.value)) && row.value != 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    });
    return flag;
}

function getPermissionsListHelper(user_id, cb) {
    var e = null;

    if (!user_id || isNaN(user_id)) {
        e = new Error("Please provide (valid) user id!");
        e.status = 400;
        return cb(e);
    }

    var opts = {
        conditions: {
            "user_id": user_id
        }
    };
    permissions_model.select(opts, function(err, result) {
        if (err) {
            util.log(err);
            e = new Error("Internal server error!");
            e.status = 500;
        }
        return cb(e, result);
    });
}


function update(permissions, user_id, cb) {
    var e = null;


    if (!permissions || !permissions.length) {
        return cb();
    }
    if (!user_id || isNaN(user_id)) {
        e = new Error("User ID required!");
        e.status = 400;
        return cb(e);
    }

   /* if (!verifyForUpdation(permissions)) {
        e = new Error("Invalid Data!");
        e.status = 400;
        return cb(e);
    }*/

    async.eachLimit(permissions, 1, function(permission, callback) {

        var data_to_update = permission;
        var id = permission.id;
        permissions_model.update(data_to_update, id, callback);
    }, function(err) {
        if (err) {
            util.log(err);
            e = new Error("Internal server Error!");
            e.status = 500;
            return cb(e);
        }
        return cb();
    });

}

function add(permissions, user_id, cb) {
    var e = null;

    if (!permissions || !permissions.length) {
        return cb();
    }
    if (!user_id || isNaN(user_id)) {
        e = new Error("User ID required!");
        e.status = 400;
        return cb(e);
    }
    permissions.forEach(function(row) {
        row.user_id = user_id;
    });

    permissions_model.insert(permissions, function(err) {
        if (err) {
            util.log(err);
            e = new Error("Internal server Error!");
            e.status = 500;
            return cb(e);
        }
        return cb();
    });
}

function remove(ids, user_id, cb) {
    var e = null;

    if (!ids || !ids.length || !util.isArray(ids)) {
        return cb();
    }
    if (!user_id || isNaN(user_id)) {
        e = new Error("User ID required!");
        e.status = 400;
        return cb(e);
    }

    async.eachLimit(ids, 1, function(permission_id, callback) {
        var conditions = {
            id: permission_id
        };
        permissions_model.remove(conditions, callback);
    }, function(err) {
        if (err) {
            util.log(err);
            e = new Error("Internal server Error!");
            e.status = 500;
            return cb(e);
        }
        return cb();
    });
}

var permissions = {

    getPermissionsListHelper: getPermissionsListHelper,

    getPermissionsList: function(req, res, next) {

        var user_id = req.params.user_id || req.body.user_id || req.user_id;

        getPermissionsListHelper(user_id, function(err, result) {
            if (err) {
                return next(err);
            }
            
            res.json({
                "permissions": result,
                "user_id": user_id
            });
        });
    },

    //updates,add,removes
    update: function(req, res, next) {

        var user_id = req.body.user_id;
        var permissions_to_update = req.body.update;
        var permissions_to_add = req.body.add;
        var permissions_to_remove = req.body.remove;

        async.series([add.bind(null, permissions_to_add, user_id), update.bind(null, permissions_to_update, user_id), remove.bind(null, permissions_to_remove, user_id)], function(err) {
            if (err) {
                return next(err);
            }

            res.json({
                "message": "done"
            });
        });
    }

};

module.exports = permissions;


//Test functions
(function() {
    if (require.main == module) {

    }
}());