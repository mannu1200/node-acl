"use strict";

var util = require("util");

var Base = require("./base");
var db = require("./db");

var columns = ["id", "user_id", "access_token", "panel_id", "api", "reference_id", "request", "created_at", "ip_address"];
var table_name = "tb_panel_audit";

var table = db.define({
    "name": table_name,
    "columns": columns
});

var audit_logs = new Base(table);
audit_logs.columns = columns;
audit_logs.table_name = table_name;


module.exports = audit_logs;

//TODO: remove update function


//Test functions
(function() {
    if (require.main == module) {
    }
}());