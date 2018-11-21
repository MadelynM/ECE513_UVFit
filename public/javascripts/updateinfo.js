// uodating the email address
function updateEmail() {
var $newEmail=$("#updateEmail").val();
var emailRe=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
console.log( $newEmail);

if(!emailRe.test($newEmail)){ //check if the email is valide
  $("#error").html("Error: " + "Invalid or missing email address.");
        $("#error").show();
        return;
  }
  else {
      $("#error").hide();

    $.ajax({
        url: '/updateinfo/email',
        type: 'POST',
        //contentType: "application/json",
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { newEmail: $newEmail },
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {

           hideUpdateEmailForm();
           $("#error").before("<div id='test1'>"+ data["message"]+"</div>");
           $("#test1").fadeOut(5000);
           window.localStorage.removeItem("authToken");
          window.localStorage.setItem("authToken", data.token);
           //window.location = "index.html";
           console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            console.log(response);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });
  }
}

function updateName() {
var $newName=$("#updateName").val();
  var fullNameRe=/^[a-zA-Z]+\s[a-zA-Z]+$/;
console.log( $newName);

if(!fullNameRe.test($newName)){ //check if the email is valide
  $("#error").html("Error: " + "Invalid fullname.");
        $("#error").show();
        return;
  }
  else {
      $("#error").hide();

    $.ajax({
        url: '/updateinfo/name',
        type: 'POST',
        //contentType: "application/json",
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { newName: $newName },
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {

      hideUpdateNameForm();
           $("#error").before("<div id='test1'>"+ data["message"]+"</div>");
           $("#test1").fadeOut(5000);

           console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            console.log(response);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });
  }
}

function updatePassword() {
  var passwordRe=/[a-z]+/;
  var passwordRe2=/[A-Z]+/;
  var passwordRe3=/[0-9]+/;
var $newPassW=$("#updatePassW").val();
var $newPassWConfirm=$("#passwordConfirm").val();
console.log( $newPassW);
if (!($newPassW.length>=10 && $newPassW.length <=20) || !passwordRe.test($newPassW) || !passwordRe2.test($newPassW) || !passwordRe3.test($newPassW)){
  $("#error").html("Error: " + "Password must be between 10 and 20 characters.<br>Password must contain at least one lowercase character.<br>Password must contain at least one uppercase character.<br>Password must contain at least one digit.");
        $("#error").show();
        return;
}
else if (!($newPassW==$newPassWConfirm)){
  $("#error").html("Error: " + "Password and confirmation password don't match.");
        $("#error").show();
        return;
}

  else {
      $("#error").hide();

    $.ajax({
        url: '/updateinfo/password',
        type: 'POST',
        //contentType: "application/json",
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { newPassword: $newPassW },
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {

      hideUpdatePassWForm();
           $("#error").before("<div id='test1'>"+ data["message"]+"</div>");
           $("#test1").fadeOut(5000);

           console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            console.log(response);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });
  }
}





// Show emailForm
function showUpdateEmailForm() {
   $("#updateEmail").val("");           // Clear the input for the email
   $("#emailForm").hide();    // Hide the add device link
   $("#updateEmailForm").slideDown();  // Show the add device form
}

// Hides emailForm
function hideUpdateEmailForm() {
   $("#emailForm").show();  // Hide the add device link
   $("#updateEmailForm").slideUp();  // Show the add device form
   $("#error").hide();
}
///////////////////////////////////////////////////////////////////
//show nameForm
function showUpdateNameForm() {
   $("#updateName").val("");           // Clear the input for the email
   $("#nameForm").hide();    // Hide the add device link
   $("#updateNameForm").slideDown();  // Show the add device form
}
function hideUpdateNameForm() {
   $("#nameForm").show();  // Hide the add device link
   $("#updateNameForm").slideUp();  // Show the add device form
   $("#error").hide();
}
//////////////////////////////////////////////////////////////

function showUpdatePassWForm() {
   $("#updatePassW").val("");
   $("#passwordConfirm").val("");          // Clear the input for the email
   $("#passForm").hide();    // Hide the add device link
   $("#updatePassWForm").slideDown();  // Show the add device form
}
function hideUpdatePassWForm() {
   $("#passForm").show();  // Hide the add device link
   $("#updatePassWForm").slideUp();  // Show the add device form
   $("#error").hide();
}
//////////////////////////////////////////////////////////////

// Handle authentication on page load
$(function() {
   $("#updateEmailForm").hide();
   $("#updateNameForm").hide();
   $("#updatePassWForm").hide();
    $("#error").hide();
   // If there's no authToekn stored, redirect user to
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   else {
    //  sendReqForAccountInfo();
   }

   // update email
   $("#emailForm").click(showUpdateEmailForm);
   $("#updateEmailButton").click(updateEmail);
   $("#cancel1").click(hideUpdateEmailForm);
// update email
   $("#nameForm").click(showUpdateNameForm);
   $("#updateNameButton").click(updateName);
   $("#cancel2").click(hideUpdateNameForm);

// update password
   $("#passForm").click(showUpdatePassWForm);
   $("#updatePassWButton").click(updatePassword);
   $("#cancel3").click(hideUpdatePassWForm);
});
