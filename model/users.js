"use strict";

var Base = require("./base");
var db = require("./db");
var permissions = require("./permissions");

var util = require("util");


var table = db.define({
    "name": "tb_acl_users",
    "columns": ["id", "name", "email", "password", "phone_number", "is_infinite_TTL", "city", "status", "recovery_token", "created_at", "updated_at"]
});

var users = new Base(table);

/*
 * @param {Array} columns - array of string of coulmn name to be selected, returns every column (except password) if not provided
 * @param {Object} conditions - for where condition (sample = {email:"test@gmail.com"})
 * @param {Number} offset
 * @param {Number} limit
 */
users.select = function(opts, cb) {
    var table = this.table,
        filters = [],
        columns = opts.columns,
        conditions = opts.conditions,
        selects = null,
        limit = opts.limit,
        offset = opts.offset;

    selects = table.star();
    if (columns) {
        selects = columns;
    }

    if (conditions) {
        Object.keys(conditions).forEach(function(k) {
            filters.push(table[k].equals(conditions[k]));
        });
        table = table.select(selects).where.apply(table, filters);
    } else {
        table = table.select(selects);
    }

    if (!filters.length && !limit) {
        return cb("Filters required while selecting!");
    }

    if (limit) {
        table = table.limit(limit);
    }
    if (offset) {
        table = table.offset(offset);
    }
    table.exec(function(err, result) {
        if (err) {
            return cb(err);
        }

        //This is preventing password is not returned until explicitly asked
        if (!columns || columns.indexOf("password") == -1) {
            result.forEach(function(k) {
                delete k.password;
            });
        }
        return cb(null, result);
    });
};


users.permissionsJoin = function(opts, cb) {
    var user_table = this.table,
        permissions_table = permissions.table,
        selects = null,
        columns = opts.columns,
        conditions = opts.conditions || [],
        filters = [];

    selects = [user_table.star(),  permissions_table.star()];
    if(columns) {
        selects = columns;
    };

    Object.keys(conditions).forEach(function(k) {
        filters.push(permissions_table[k].equals(conditions[k]));
    });

    if (!filters.length) {
        return cb("Conditions required!");
    }

    var query = user_table
        .select(selects)
        .from(
        user_table
            .join(permissions_table).on(user_table.id.equals(permissions_table.user_id)));

    query.where.apply(query, filters).exec(cb);

}

module.exports = users;

//Test functions
(function() {
    if (require.main === module) {
        /*users.insert({
            name: "mannu",
            email: "mannu1200@gmail.com",
            password: "xyz",
            status: "ACTIVE"
        }, console.log);*/
        users.select({
            columns: ["email", "password"],
            limit: 20,
            //offset: 2
            /*conditions: {
                name: "mannu",
                email: "mannu1200@gmail.com"
            }*/
        }, console.log);
        /* users.update({
            email: "blabla23@gmail.com",
            phone_no: 9868571791,
            status: "ACTIVE",
            is_infinite_TTL: 1
        }, 1, console.log);*/
    }
}());
