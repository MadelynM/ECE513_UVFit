function sendReqForAccountInfo() {
   $.ajax({
      url: '/users/account',
      type: 'GET',
      headers: { 'x-auth': window.localStorage.getItem("authToken") },
      responseType: 'json',
      success: accountInfoSuccess,
      error: accountInfoError
   });
}

function accountInfoSuccess(data, textSatus, jqXHR) {
   $("#email").html(data.email);
   $("#fullName").html(data.fullName);
   $("#lastAccess").html(data.lastAccess);
   $("#main").show();

   // Add the devices to the list before the list item for the add device button (link)
   for (var device of data.devices) {
      $("#addDeviceForm").before("<li class='collection-item'>ID: " +
        device.deviceId + ", APIKEY: " + device.apikey + "</li>")
   }

}

function accountInfoError(jqXHR, textStatus, errorThrown) {
   // If authentication error, delete the authToken
   // redirect user to sign-in page (which is index.html)
   if( jqXHR.status === 401 ) {
      console.log("Invalid auth token");
      window.localStorage.removeItem("authToken");
      window.location.replace("index.html");
   }
   else {
     $("#error").html("Error: " + status.message);
     $("#error").show();
   }
}

// Registers the specified device with the server.
function registerDevice() {
  var pass1=/[a-z]+/;
  var pass2=/[A-Z]+/;
  var pass3=/[0-9]+/;
var $checkVal=$("#deviceId").val();

//console.log( $newPassW);
if (!pass1.test($checkVal) && !pass2.test($checkVal) && !pass3.test($checkVal)){
  $("#error").html("Error: " + "Invalide device Id.");
        $("#error").show();
        return;
}

  console.log();
    $.ajax({
        url: '/devices/register',
        type: 'POST',
        //contentType: "application/json",
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { deviceId: $("#deviceId").val() }, //, email: $("#email").text()
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           $("#addDeviceForm").before("<li class='collection-item'>ID: " +
           $("#deviceId").val() + ", APIKEY: " + data["apikey"] + "</li>")
           hideAddDeviceForm();
           $("#error").before("<div id='test'>"+ data["message"]+"</div>");
           $("#test").fadeOut(5000);
           console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });

}

function replaceDevice() {
  var pass1=/[a-z]+/;
  var pass2=/[A-Z]+/;
  var pass3=/[0-9]+/;
var $checkVal=$("#deviceOld").val();
var $checkVal2=$("#deviceNew").val();
//console.log( $newPassW);
if (!pass1.test($checkVal) && !pass2.test($checkVal) && !pass3.test($checkVal)){
  $("#error").html("Error: " + "Invalide device Id.");
        $("#error").show();
        return;
}
if (!pass1.test($checkVal2) && !pass2.test($checkVal2) && !pass3.test($checkVal2)){
  $("#error").html("Error: " + "Invalide device Id.");
        $("#error").show();
        return;
}

  console.log();
    $.ajax({
        url: '/devices/replace',
        type: 'PUT',
        //contentType: "application/json",
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: {
          deviceOld: $("#deviceOld").val(),
          deviceNew: $("#deviceNew").val()
         }, //, email: $("#email").text()
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
           // Add new device to the device list
           hideReplaceDeviceForm();
           $("#error").before("<div id='test1'>"+ data["message"]+"</div>");
           $("#test1").fadeOut(5000);
           console.log(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });

}






// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
   $("#deviceId").val("");           // Clear the input for the device ID
   $("#addDeviceControl").hide();    // Hide the add device link
   $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
   $("#addDeviceControl").show();  // Hide the add device link
   $("#addDeviceForm").slideUp();  // Show the add device form
   $("#error").hide();
}

function showReplaceDeviceForm() {
   $("#deviceOld").val("");
    $("#deviceNew").val("");         // Clear the input for the device ID
   $("#relpaceDeviceControl").hide();    // Hide the add device link
   $("#replaceDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideReplaceDeviceForm() {
   $("#relpaceDeviceControl").show();  // Hide the add device link
   $("#replaceDeviceForm").slideUp();  // Show the add device form
   $("#error").hide();
}


// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   else {
      sendReqForAccountInfo();
   }

   // Register event listeners
   $("#addDevice").click(showAddDeviceForm);
   $("#registerDevice").click(registerDevice);
   $("#cancel").click(hideAddDeviceForm);

   $("#replaceDevice").click(showReplaceDeviceForm);
   $("#replaceDeviceButton").click(replaceDevice);
   $("#cancel4").click(hideReplaceDeviceForm);
});
