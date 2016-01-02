"use strict";

var util = require("util");

var Base = require("./base");
var db = require("./db");

var columns = ["id", "user_id", "city_id", "level_id", "panel_id", "role"];
var table_name = "tb_acl_permissions";

var table = db.define({
    "name": table_name,
    "columns": columns
});

var permissions = new Base(table);
permissions.columns = columns;
permissions.table_name = table_name;
permissions.table = table;


module.exports = permissions;

//TODO: remove update function


//Test functions
(function() {
    if (require.main == module) {
    }
}());