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
   if (!req.body.date || !req.body.activityId || !req.body.longitude ||
       !req.body.latitude || !req.body.uvLevel) {
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
            var snapshot = {date: Date(req.body.date),
               longitude: req.body.longitude,
               latitude: req.body.latitude,
               uvLevel: req.body.uvLevel
            };
            Activity.findOne({email: device.email, activityId: req.body.activityId}, function (err, activity) {
               if (err) {
                  responseJson.success = false;
                  responseJson.message = "Error communicating with database.";
                  return res.status(500).json(responseJson);
               }
               else if (!activity) {
                  var newActivity = new Activity({
                     userEmail: device.email,
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

module.exports = router;
