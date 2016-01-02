"use strict";


var anydbsql = require("anydb-sql");
var util = require("util");
var config = require("../config/app_config").anydbsql;

var db = anydbsql({
    url: util.format("mysql://%s:%s@%s/%s",
        encodeURIComponent(config.user),
        encodeURIComponent(config.password),
        config.host,
        config.database),
    connections: {
        min: config.min,
        max: config.max
    }
});

module.exports = db;


//Test functions
(function() {
    if (require.main == module) {
        for (var i = 0; i <= 50; i++) {
            db.query("insert into test(id) values(" + i + ")", console.log);
        }
    }
}());