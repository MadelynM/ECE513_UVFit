var express = require('express');
var router = express.Router();
var fs = require('fs');
var User = require("../models/users");
var Device = require("../models/device");
var Activity = require("../models/activity");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");

/* Authenticate user */
//var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();
var secret = "supersecretserverpassword";

router.post('/new', function(req, res, next) {
   var responseJson = {success: true, message: ""};
   if (!req.body.date || !req.body.activityId || !req.body.latitude ||
       !req.body.longitude || !req.body.uvLevel || !req.body.speed) {
      responseJson.success = false;
      responseJson.message = "Invalid request";
      return res.status(400).json(responseJson);
   }
   else {
      Device.findOne({apikey: req.body.apikey}, function(err, device) {
         if (err) {
            responseJson.success = false;
            responseJson.message = "Error communicating with database.";
            return res.status(500).json(responseJson);
         }
         else if(!device) {
            responseJson.success = false;
            responseJson.message = "Invalid API key.";
            return res.status(401).json(responseJson);
         }
         else {
            var snapshot = {date: new Date(req.body.date),
               latitude: req.body.latitude,
               longitude: req.body.longitude,
               speed: req.body.speed,
               uvLevel: req.body.uvLevel
            };
            Activity.findOne({userEmail: device.userEmail, activityId: req.body.activityId}, function (err, activity) {
               if (err) {
                  responseJson.success = false;
                  responseJson.message = "Error communicating with database.";
                  return res.status(500).json(responseJson);
               }
               else if (!activity) {
                  var newActivity = new Activity({
                     userEmail: device.userEmail,
                     activityId: req.body.activityId,
                     snapshots: [snapshot]
                  });

                  newActivity.save(function(err, newActivity) {
                     if (err) {
                        responseJson.success = false;
                        responseJson.message = err;
                        return res.status(400).json(responseJson);
                     }
                     else {
                        responseJson.message = "Activity with ID " + req.body.activityId + " was saved.";
                        return res.status(201).json(responseJson);
                     }
                 });
               }
               else {
                  activity.snapshots.push(snapshot);
                  activity.save(function(err, newActivity) {
                     if (err) {
                        responseJson.success = false;
                        responseJson.message = err;
                        return res.status(400).json(responseJson);
                     }
                     else {
                        responseJson.message = "Activity with ID " + req.body.activityId + " was saved.";
                        return res.status(201).json(responseJson);
                     }
                  });
               }
            });
         }
      });
   }
});

router.get('/retrieve/:actid', function(req, res, next) {
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }

   var authToken = req.headers["x-auth"];

   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};

      var activityId = req.params.actid;
      if (activityId === "all") {
         var query = {"userEmail": decodedToken.email};
      }
      else {
         var query = {"userEmail": decodedToken.email, "activityId": activityId};
      }

      Activity.find(query, function(err, activities) {
         if(err) {
            return res.status(400).json({success: false, message: "Error looking up activity."});
         }
         else {
            return res.status(200).json({success: true, activities: activities});
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }

});



module.exports = router;
