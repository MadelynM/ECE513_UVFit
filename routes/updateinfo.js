var express = require('express');
var router = express.Router();
var Device = require("../models/device");
var Activity = require("../models/activity");
var bcrypt = require("bcrypt-nodejs");
var fs = require('fs');
var jwt = require("jwt-simple");
var User = require("../models/users");

// Secret key for JWT
var secret = "supersecretserverpassword";
var authenticateRecentEndpoint = true;

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}

router.post("/email", function(req, res) {

  var responseJson = {
        success: false,
        message: ""
    };
    var stat2={};
    var stat3={};

var dtoken = authenticateAuthToken(req);
if (dtoken==null){
  responseJson.message = "Authentication failed";
  return res.status(401).json(responseJson);
}
      if (!dtoken){
         responseJson.message = "Authentication failed";
         return res.status(401).json(responseJson);
      }

   Device.update({userEmail: dtoken.email },
      { userEmail: req.body.newEmail },
      { multi: true },
      function(err, sta2) {
        if (err){
           res.status(401).json({success : false, message : "Error communicating with database.", status2:stat2 });
           return;
        }
        else if (!sta2){
          res.status(401).json({success : false, message : "The email or password provided was invalid." , status2:stat2 });
          return;
        }
        else {
           stat2=sta2;
                Activity.update({userEmail: dtoken.email },
                   { userEmail: req.body.newEmail },
                   { multi: true },
                   function(err, sta3) {
                     if (err){
                        res.status(401).json({success : false, message : "Error communicating with database."});
                        return;
                     }
                     else if (!sta3){
                       res.status(401).json({success : false, message : "The email or password provided was invalid."});
                       return;
                     }
                     else {
                            stat3=sta3;

                        User.update({email: dtoken.email },
                           { email: req.body.newEmail },
                           { multi: true },
                           function(err, sta) {
                             if (err){
                                res.status(401).json({success : false, message : "Error communicating with database."});
                                return;
                             }
                             else if (!sta){
                               res.status(401).json({success : false, message : "The email or password provided was invalid."});
                               return
                             }
                             else {
                             var token = jwt.encode({email: req.body.newEmail}, secret);
                               res.status(201).json({success : true, message : "Your email has been update", token:token , status:sta, status2:stat2, status3:stat3});
                               return;
                            //  console.log("Documents updated: " + status.nModified);
                               }
                           });
                       }
                  });
              }
         });
     });

router.post("/name", function(req, res) {

       var responseJson = {
             success: false,
             message: ""
         };
      var dtoken = authenticateAuthToken(req);
        if (dtoken==null){
           responseJson.message = "Authentication failed";
           return res.status(401).json(responseJson);
       }
        if (!dtoken){
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
       }

       User.update({email: dtoken.email },
          { fullName: req.body.newName },
          { multi: false },
          function(err, sta) {
            if (err){
               res.status(401).json({success : false, message : "Error communicating with database."});
               return;
            }
            else if (!sta){
              res.status(401).json({success : false, message : "The email or password provided was invalid."});
              return
            }
            else {
              res.status(201).json({success : true, message : "Your name has been update", status:sta });
              return;
           //  console.log("Documents updated: " + status.nModified);
              }
          });

});

router.post("/password", function(req, res) {

       var responseJson = {
             success: false,
             message: ""
         };
      var dtoken = authenticateAuthToken(req);
        if (dtoken==null){
           responseJson.message = "Authentication failed";
           return res.status(401).json(responseJson);
       }
        if (!dtoken){
            responseJson.message = "Authentication failed";
            return res.status(401).json(responseJson);
       }

       bcrypt.hash(req.body.newPassword, null, null, function(err, hash) {
            //  var passwordHash = hash; // hashed password

       User.update({email: dtoken.email },
          { passwordHash: hash },//FEXME
          { multi: false },
          function(err, sta) {
            if (err){
               res.status(401).json({success : false, message : "Error communicating with database."});
               return;
            }
            else if (!sta){
              res.status(401).json({success : false, message : "The email or password provided was invalid."});
              return
            }
            else {
              res.status(201).json({success : true, message : "Your password has been update", status:sta });
              return;
           //  console.log("Documents updated: " + status.nModified);
              }
          });
      });

});




module.exports = router;
