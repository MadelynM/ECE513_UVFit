function sendReqForSignup() {

var responseDiv = document.getElementById('ServerResponse');
  // FIXME: More thorough validation should be performed here. 
  //if (password != passwordConfirm) {
   // var responseDiv = document.getElementById('ServerResponse');
    //responseDiv.style.display = "block";
    //responseDiv.innerHTML = "<p>Password does not match.</p>";
   // return;
 // }
  //*************************************************************************//
  //Checking for a good password 
var fullNameIsValid=false;
var emailIsValid=false;
var passwordIsValid=false;
var passwordIsValid1=false;
var passwordIsValid2=false;
var passwordIsValid3=false;
var passwordIsValid4=false;

  var divFormErrors= document.getElementById("ServerResponse");
    var fullName=document.getElementById("fullName");
    var email=document.getElementById("email");
    var password=document.getElementById("password");
    var confirmPassword=document.getElementById("passwordConfirm");
    
    if(document.getElementById("ul")==null){
        var ul=document.createElement("UL");
        ul.setAttribute("id", "ul");
        divFormErrors.appendChild(ul);
        /*console.log(ul);*/
    }

    var fullNameRe=/^[a-zA-Z]+\s[a-zA-Z]+$/;
    var emailRe=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    var passwordRe=/[a-z]+/;
    var passwordRe2=/[A-Z]+/;
    var passwordRe3=/[0-9]+/;
    
  
  var removeNameError=document.getElementById("nameItem");
  var removeEmailError=document.getElementById("emailItem");
  var removePassLengthError=document.getElementById("passLenght");
  var removePassError1=document.getElementById("passAtLeastOneChar");
  var removePassError2=document.getElementById("passAtLeastOneChar2");
  var removePassError3=document.getElementById("passAtLeastOneDigit");
  var removePassError4=document.getElementById("confirm");
  
    if(fullNameRe.test(fullName.value)){ //check if the full name is valide
        fullNameIsValid=true;
        fullName.classList.remove("error");
        if(removeNameError!=null){
         removeNameError.parentNode.removeChild(removeNameError);
        }
        /* console.log("nameValid");*/
    }
      else{
          fullName.classList.add("error");
        divFormErrors.style.display="block";
        if(removeNameError==null){
        var li=document.createElement("LI");
        li.setAttribute("id", "nameItem");
        var errMessage=document.createTextNode("Missing full name.");
        li.appendChild(errMessage);
         $("#ul").append(li);
        //document.getElementsByTagName("ul")[0].appendChild(li);
        }
    }
    if(emailRe.test(email.value)){ //check if the email is valide
      emailIsValid=true;
     email.classList.remove("error");
     if(removeEmailError!=null){
         removeEmailError.parentNode.removeChild(removeEmailError);
        }
    }
    else{
    email.classList.add("error");
    divFormErrors.style.display="block";
    if(removeEmailError==null){
        var li2=document.createElement("LI");
        li2.setAttribute("id", "emailItem");
        var emailErrMessage=document.createTextNode("Invalid or missing email address.");
        li2.appendChild(emailErrMessage);
        $("#ul").append(li2);
       // document.getElementById("ul").appendChild(li2);
    }
    }
    /*Password length*/
    if (password.value.length>=10 && password.value.length <=20){
        password.classList.remove("error");
        passwordIsValid=true;
        if (removePassLengthError!=null){
            removePassLengthError.parentNode.removeChild(removePassLengthError);
        }
    }
    else{
        password.classList.add("error");
        divFormErrors.style.display="block";
        if (removePassLengthError==null){
            var li3=document.createElement("LI");
            li3.setAttribute("id", "passLenght");
            var passLengthMessage=document.createTextNode("Password must be between 10 and 20 characters.");
            li3.appendChild(passLengthMessage);
             $("#ul").append(li3);
           // document.getElementsByTagName("ul")[0].appendChild(li3);
        }
    }
    /*Password at least one lowercase char*/
    if (passwordRe.test(password.value)){
        password.classList.remove("error");
        passwordIsValid1=true;
        if (removePassError1!=null){
            removePassError1.parentNode.removeChild(removePassError1);
        }
    }
    else{
        password.classList.add("error");
        divFormErrors.style.display="block";
        if (removePassError1==null){
            var li4=document.createElement("LI");
            li4.setAttribute("id", "passAtLeastOneChar");
            var passOneCharMessage=document.createTextNode("Password must contain at least one lowercase character.");
            li4.appendChild(passOneCharMessage);
             $("#ul").append(li4);
           // document.getElementsByTagName("ul")[0].appendChild(li4);
        }
    }
    /*Password at least one uppercase char*/
    
      if (passwordRe2.test(password.value)){
        password.classList.remove("error");
        passwordIsValid2=true;
        if (removePassError2!=null){
            removePassError2.parentNode.removeChild(removePassError2);
        }
    }
    else{
        password.classList.add("error");
        divFormErrors.style.display="block";
        if (removePassError2==null){
            var li5=document.createElement("LI");
            li5.setAttribute("id", "passAtLeastOneChar2");
            var passOneCharMessage2=document.createTextNode("Password must contain at least one uppercase character.");
            li5.appendChild(passOneCharMessage2);
             $("#ul").append(li5);
           // document.getElementsByTagName("ul")[0].appendChild(li5);
        }
    }
    /*Password at least one digit*/
          if (passwordRe3.test(password.value)){
        password.classList.remove("error");
        passwordIsValid3=true;
        if (removePassError3!=null){
            removePassError3.parentNode.removeChild(removePassError3);
        }
    }
    else{
        password.classList.add("error");
        divFormErrors.style.display="block";
        if (removePassError3==null){
            var li6=document.createElement("LI");
            li6.setAttribute("id", "passAtLeastOneDigit");
            var passOneDigit=document.createTextNode("Password must contain at least one digit.");
            li6.appendChild(passOneDigit);
             $("#ul").append(li6);
            //document.getElementsByTagName("ul")[0].appendChild(li6);
        }
    }
    /*Password confirm*/
              if (password.value==confirmPassword.value){
        confirmPassword.classList.remove("error");
        passwordIsValid4=true;
        if (removePassError4!=null){
            removePassError4.parentNode.removeChild(removePassError4);
        }
    }
    else{
        confirmPassword.classList.add("error");
        divFormErrors.style.display="block";
        if (removePassError4==null){
            var li7=document.createElement("LI");
            li7.setAttribute("id", "confirm");
            var passConfirmMessage=document.createTextNode("Password and confirmation password don't match.");
            li7.appendChild(passConfirmMessage);
             $("#ul").append(li7);
            //document.getElementsByTagName("ul")[0].appendChild(li7);
        }
    }
    if(fullNameIsValid==true &&  emailIsValid==true &&   passwordIsValid==true
    && passwordIsValid1==true && passwordIsValid2==true && passwordIsValid3==true && passwordIsValid4==true){
        divFormErrors.style.display="none";
        
    }
    else {
       return;
    }

  

  //*************************************************************************//
    var emailReq = document.getElementById("email").value;
  var fullNameReq = document.getElementById("fullName").value;
  var passwordReq = document.getElementById("password").value;
  var passwordConfirmReq

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", signUpResponse);
  xhr.responseType = "json";
  xhr.open("POST", '/users/register');
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify({email:emailReq,fullName:fullNameReq, password:passwordReq}));
}

function signUpResponse() {
  // 200 is the response code for a successful GET request
  if (this.status === 201) {
    if (this.response.success) {
      // Change current location to the signin page.
      window.location = "index.html";
    } 
    else {
      responseHTML += "<ol class='ServerResponse'>";
      for (key in this.response) {
        responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
      }
      responseHTML += "</ol>";
    }
  }
  else {
    // Use a span with dark red text for errors
    responseHTML = "<span class='red-text text-darken-2'>";
    responseHTML += "Error: " + this.response.error;
    responseHTML += "</span>"
  }

  // Update the response div in the webpage and make it visible
  responseDiv.style.display = "block";
  responseDiv.innerHTML = responseHTML;
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("signup").addEventListener("click", sendReqForSignup);
});
