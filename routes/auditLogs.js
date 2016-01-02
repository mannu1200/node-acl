"use strict";

var util = require("util");

var audit_logs_model = require("../model/audit_logs");


var audit_logs = {

    makeLogs: function(req, res, next) {
        var body = req.body;
        body.user_id = req.user_id;

        next(); //sending pre mature callback so that logging audit data dont become bottleneck
        
        var data = {};
        ["user_id", "panel_id", "api", "reference_id", "request","access_token"].forEach(function(d){
            data[d] = body[d];
        });

        // Also log the IP address.
        data.ip_address = req.connection.remoteAddress;
	if(data.api.indexOf('?') != -1) {
                data.api = data.api.split('?')[0];
        }

        audit_logs_model.insert(data,function(err){
            if(err) {
                util.log(err);
            }
        });
    }
};


module.exports = audit_logs;
