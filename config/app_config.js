module.exports = require("rc")("app_cofig", {
    "PORT": 4242,

    "anydbsql": {
        "user": "root",
        "password": "fJ7975jgSssh",
        "host": "127.0.0.1",
        "database": "acl",
        "min": 2,
        "max": 40
    },

    "database_constants": {
        "acl_users": {
            "status": ["ACTIVE", "INACTIVE"]
        },
        "acl_tokens": {
            "default_TTL": 7, //in days,if changing this, change above cookie header too
            "infinite_TTL": 999
        }
    },

    "email": {
        "from_email" : "support@gmail.com",
        "from_name" : "Support",
        "mandrill": {
            "API_KEY": "ABCD",
            "APIs": {
                "send": "/messages/send"
            }
        }
    }
});
