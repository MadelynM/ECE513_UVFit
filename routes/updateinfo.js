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

router.put("/email", function(req, res) {

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



  User.findOne({ email: req.body.newEmail  }, function(err, user) {
            if (user !== null) {
                responseJson.message = "Email entered is already registered.";
                return res.status(400).json(responseJson);
            }
            else {


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
                               return;
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

       }
        });
     });

router.put("/name", function(req, res) {

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

router.put("/password", function(req, res) {

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

router.put('/location', function(req, res, next) {
  var responseJson = {success: false, message: ""};
  if (!req.headers["x-auth"]) {
    responseJson.success = false;
    responseJson.message = "No authentication token";
    return res.status(401).json(responseJson);
  }
  authToken = req.headers["x-auth"];
  if (!req.body.newLocation) {
    responseJson.success = false;
    responseJson.message = "Invalid request";
    return res.status(400).json(responseJson);
  }
  try {
    var decodedToken = jwt.decode(authToken, secret);
    var newLocation = req.body.newLocation;
    var locationRe = /^(-?[0-9]+\.?[0-9]*),\s*(-?[0-9]+\.?[0-9]*)$/;
    var locationArray = newLocation.match(locationRe);
    if(!locationArray) {
      responseJson.success = false;
      responseJson.message = "Invalid location.";
      return res.status(400).json(responseJson);
    }
    latitude = parseFloat(locationArray[1]);
    longitude = parseFloat(locationArray[2]);
    if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) {
      responseJson.success = false;
      responseJson.message = "Invalid location: -90 <= latitude <= 90, 180 <= longitude <= 180";
      return res.status(400).json(responseJson);
    }
    var query = {"email": decodedToken.email};
    User.update({email: decodedToken.email},
      {userLoc: {type: "Point", coordinates: [longitude, latitude]}},
      {multi: false},
      function(err, sta) {
        if(err) {
          responseJson.success = false;
          responseJson.message = "Error updating location.";
          return res.status(400).json(responseJson);
        }
        else if(!sta) {
          responseJson.success = false;
          responseJson.message = "Error looking up user";
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.success = true;
          responseJson.message = "Location successfully updated";
          return res.status(200).json(responseJson);
        }
      }
    );
  }
  catch(ex) {
    responseJson.success = false;
    responseJson.message = ex.message;//"Invalid authentication token.";
    return res.status(401).json(responseJson);
  }
});

module.exports = router;
