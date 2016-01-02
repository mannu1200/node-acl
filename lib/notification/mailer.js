"use strict";

var config = require("../../config/app_config").email;
var mandrill_config = config.mandrill;
var mandrill = require("node-mandrill")(mandrill_config.API_KEY);

var email = {
    /*
     * @param {Array} to - array of json {email,name}
     * @param {String} subject
     * @param {String} text - plain email body
     * @param {String} html - html email body
     */
    send: function(opts, cb) {

        var api = mandrill_config.APIs.send;

        opts.from_email = config.from_email;
        opts.from_name = config.from_name;
        var data = {
            message: opts
        };
        mandrill(api, data, function(error, message) {
            return cb ? cb(error, message) : undefined;
        });
    }
};

module.exports = email;


//Test functions
(function() {
    if (require.main == module) {
        var opts = {
                    "to": [{
                        email: "mannu1200@gmail.com"
                    }],
                    "subject": "Reset your password!",
                    "html": require("ejs").render(require("fs").readFileSync().toString(), {
                        "user": "mannu1200@gmail.com",
                        "url": "google.com"
                    })
                };
        email.send(opts, console.log);
    }
}());
