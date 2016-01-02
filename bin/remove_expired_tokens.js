"use strict";

var db = require("../model/db");
var config = require("../config/app_config");

function getAccessTokens(date, cb) {

    var query = "select token from tb_acl_tokens where created_at <= ?";
    db.query(query, cb);
}

var remove_expired_tokens = {
    init: function(cb) {
        var d = new Date();
        d.setDate(d.getDate() - config.tb_acl_tokens.default_TTL);
        getAccessTokens(d, function());
    }
};

(function() {
    remove_expired_tokens.init(function(err, result) {
        console.log(err, result);
    });
}());