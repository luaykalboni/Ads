
$(document).ready(function () {

    msgInA = 0;

    var msg = [];

    var id = prompt('pick a screen');
    let passWord = "";

    $.ajax({

        url: "http://localhost:8080/checkUser=" + id,
        type: "GET",
        success: (usr) => {

            if (usr == []) {
                $('#tempA').html("user does not exist");
                return;
            }

            if (usr.connected)
                validUser();
            else {

                passWord = prompt('enter pass word');
                if (passWord == usr.passWord) {

                    logIn();
                    validUser();
                } else {
                    $('#tempA').html("incorrect password")
                }
            }
        }
    });

    function logIn() {

        $.ajax({
            url: "http://localhost:8080/userLogIn=" + id,
            type: "GET"
        });
    }

    function validUser() {

        $.ajax({
            url: "http://localhost:8080/screen=" + id,
            type: "GET",
            success: function (arr) {
                $('user').innerText = "Hello User "+id;
                $('#changePaswwordBttn').show();
                $('#logOut').show();
                msg = arr;
                rend();
            },
            error: function (err) {
                console.log(err);
            }
        });
    }


    function rend() {

        checkMessage = msg.shift();

        if (checkMessage == undefined)
            return;
        else
            displayMessage(checkMessage);

        setTimeout(rend, 1000 * parseInt(checkMessage.length));
    }


    function displayMessage(msg) {

        if (msg == null)
            return;


        if (msg.template == 'A') {

            $.ajax({
                url: "http://localhost:8080/template=" + 'A',
                type: "GET",
                success: function (file) {

                    msgInA = msg;
                    $("#tempA").html(file);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
        if (msg.template == 'B') {

            $.ajax({
                url: "http://localhost:8080/template=" + 'B',
                type: "GET",
                success: function (file) {
                    msgInB = msg;
                    $("#tempA").html(file);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
        if (msg.template == 'C') {

            $.ajax({
                url: "localhost:8080/template=" + 'C',
                type: "GET",
                success: function (file) {
                    msgInC = msg;
                    $("#tempA").html(file);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    }

    $('#logOut').click(() => {

        $.ajax({
            url: "http://localhost:8080/userLogOut=" + id,
            type: "GET"
        });

        $('#tempA').hide();
        $('#changePaswwordBttn').hide();
        $('#logOut').hide();
    });

    $('#changePaswwordBttn').click(() => {

        const newPassWord = prompt('choose a new password');
        if(newPassWord == null)
            return;
            
        
        $.ajax({
            url: "http://localhost:8080/userPassWordChange=" + id + '&' + newPassWord,
            type: "GET",
            success: (response) => {
                alert(response);
            }
        });
    });


});