var express = require('express');
var router = express.Router();
var Device = require("../models/device");
var Activity = require("../models/activity");

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

router.get("/data", function(req, res) {

  var responseJson = {
        success: false,
        message: "",
        snapshots: []
    };

var dtoken = authenticateAuthToken(req);

      if (!dtoken){
         responseJson.message = "Authentication failed";
         return res.status(401).json(responseJson);
      }

      Activity.findOne({userEmail: dtoken.email}, function(err, activity){
          if(err){
            responseJson.message = "Error accessing db.";
            return res.status(200).json(responseJson);
          }
          else if (!activity){
            responseJson.message = "No activitis have been recorded.";
            return res.status(200).json(responseJson);
          }
          else{
            for (var snapshot of activity.snapshots){
              var data={
                lat:snapshot.latitude,
                long:snapshot.longitude,
                uvVal:snapshot.uvLevel
              };
              responseJson.snapshots.push(data);
            }
            responseJson.success=true;
              responseJson.message = "Data found";
            return res.status(200).json(responseJson);
          }
      });

});







module.exports = router;
