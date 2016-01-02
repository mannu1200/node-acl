$(document).ready(function() {
    function login() {
        var url = "/v1/acl/user/login",
            method = "POST";
        $.ajax({
            url: url,
            type: method,
            data: {
                "email": document.getElementById("email"),
                "password": document.getElementById("password")
            },
            success: function(responseData, textStatus, jqXHR) {
            	
            }
        });

    }
});