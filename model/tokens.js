"use strict";

var util = require("util");

var db = require("./db");
var Base = require("./base");


var table = db.define({
    "name": "tb_acl_tokens",
    "columns": ["id", "token", "user_id", "TTL", "created_at"]
});

var tokens = new Base(table);

module.exports = tokens;

//Test functions
(function() {
    if (require.main == module) {
        var opts = {
                conditions: {
                    "user_id": 1,
                    "token": "123456dfgfdg34%$#43"
                },
                columns: ["token"]
            }
            tokens.select(opts, console.log);

        var opts_insert = {
            "user_id": 1,
            "token": "123321qweewq"
        };
        tokens.insert(opts_insert, console.log);
        //tokens.remove(opts_insert, console.log);
    }
}());