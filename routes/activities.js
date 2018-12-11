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
   if (!req.body.activityId || !req.body.latitude ||
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
            var date = new Date();
            if(req.body.date) {
              date = Date(parseInt(req.body.date));
            }
            var snapshot = {date: date,
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
                     startDate: date,
                     endDate: date,
                     startLoc: {
                        type: "Point",
                        coordinates: [req.body.longitude, req.body.latitude]
                     },
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
                  if (activity.startDate > snapshot.date) {
                    activity.startDate = snapshot.date;
                  }
                  if (activity.endDate < snapshot.date) {
                    activity.endDate = snapshot.date;
                  }
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
      else if (activityId === "week") {
//         var dateNow = new Date();
//         var weekAgo = new Date(dateNow.getTime() - 1000*60*60*24*7);
         var query = {
           "userEmail": decodedToken.email,
           "startDate": {"$gte": weekAgo()}
         };
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

router.put('/update/type', function(req, res, next) {
   var responseJson = {success: true, message: ""};
   if (!req.headers["x-auth"]) {
      responseJson.success = false;
      responseJson.message = "Invalid authentication token";
      return res.status(401).json(responseJson);
   }
   if (!req.body.activityId || !req.body.activityType) {
      responseJson.success = false;
      responseJson.message = "Invalid request";
      return res.status(400).json(responseJson);
   }

   var authToken = req.headers["x-auth"];

   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};

      var activityId = req.body.activityId;
      var query = {"userEmail": decodedToken.email,
         "activityId": activityId
      };
      Activity.findOne(query, function(err, activity) {
         if(err) {
            responseJson.success = false;
            responseJson.message = "Error looking up activity.";
            return res.status(500).json(responseJson);
         }
         else {
            activity.activityType = req.body.activityType;
            activity.save(function(err) {
               if (err) {
                  responseJson.success = false;
                  responseJson.message = err;
                  return res.status(400).json(responseJson);
               }
               else {
                  responseJson.message = "Activity with ID " + req.body.activityId + " was updated.";
                  return res.status(200).json(responseJson);
               }
            });
         }
      });

   }
   catch(ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});

// Spherical distance, from stackoverflow

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function sphereDist(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function reduceActivity(activity) {
  // Number of calories burned in 1s per activity at given speed
  // Given values are kind of okay
  var calPerOne = {
    walking: 100/(60*60),
    running: 100/(60*60),
    biking: 50/(60*60)
  };


  var result = {
    duration: 0,
    burned: 0,
    uvTotal: 0,
    distance: 0
  };

  var activityType = activity.activityType;
  var startDate = new Date(activity.startDate);
  var endDate = new Date(activity.endDate);
  result.duration = (endDate.getTime() - startDate.getTime());

  if (!activityType) {
    activityType = "walking";
  }

  var lat0 = null;
  var lng0 = null;
  for (var i=0; i < activity.snapshots.length; i++) {
    lat = activity.snapshots[i].latitude;
    lng = activity.snapshots[i].longitude;
    if (lat0 !== null && lng0 !== null) {
      result.distance += sphereDist(lat0, lng0, lat, lng);
    }
    lat0 = lat;
    lng0 = lng;
    result.burned += calPerOne[activityType]*activity.snapshots[i].speed;
    result.uvTotal += activity.snapshots[i].uvLevel;
  }
  return result;
}

function summarizeActivities(activities) {
  var numAct = activities.length;
  var result = {
    numAct: numAct,
    avgDist: 0,
    avgBurned: 0,
    avgUvTotal: 0
  }
  for (var i = 0; i < numAct; i++) {
    resultOne = reduceActivity(activities[0]);
    result.avgDist += resultOne.distance;
    result.avgBurned += resultOne.burned;
    result.avgUvTotal += resultOne.uvTotal;
  }
  result.avgDist /= numAct;
  result.avgBurned /= numAct;
  result.avgUvTotal /= numAct;
  return result;
}

function weekAgo(){
  var dateNow = new Date();
  return new Date(dateNow.getTime() - 1000*60*60*24*7);
}

router.get('/summary/:sumType', function(req, res, next) {
   responseJson = {success: false, message: ""};
   if (!req.headers["x-auth"]) {
      responseJson.success = false;
      responseJson.message = "No authentication token.";
      return res.status(401).json(responseJson);
   }

   var authToken = req.headers["x-auth"];

   try {
      var decodedToken = jwt.decode(authToken, secret);

      var sumType = req.params.sumType;
      var dateNow = new Date();

      if (sumType === "all") {
        var query = {"startDate": {"$gte": weekAgo()}};
        Activity.find(query, function(err, activities) {
          if(err) {
            responseJson.success = false;
            responseJson.message = "Error communicating with database.";
            return res.status(400).json(responseJson);
          }
          else if (activities.length == 0) {
            responseJson.success = true;
            responseJson.message = {numAct:0,avgDist:0,avgBurned:0,avgUvTotal:0};
            return res.status(400).json(responseJson);
          }
          result = summarizeActivities(activities);
          responseJson.success = true;
          responseJson.message = result;
          return res.status(200).json(responseJson);
        });
        return;
      }
      else if (sumType === "near") {
        User.findOne({email: decodedToken.email}, function(err, user) {
          if(err) {
            responseJson.success = false;
            responseJson.message = "Error communicating with database.";
            return res.status(400).json(responseJson);
          }
          else if(!user) {
            responseJson.success = false;
            responseJson.message = "Unable to find user.";
            return res.status(400).json(responseJson);
          }

          var query = {
            startDate: {"$gte": weekAgo()},
            startLoc: {
              "$near": {
                "$maxDistance": 10000,
                "$geometry": user.userLoc
              }
            }
          };
          Activity.find(query, function(err, activities) {
            if(err) {
              responseJson.success = false;
              responseJson.message = "Error communicating with database.";
              return res.status(400).json(responseJson);
            }
            else if (activities.length == 0) {
              responseJson.success = true;
              responseJson.message = {numAct:0,avgDist:0,avgBurned:0,avgUvTotal:0};
              return res.status(200).json(responseJson);
            }
            result = summarizeActivities(activities);
            responseJson.success = true;
            responseJson.message = result;
            return res.status(200).json(responseJson);
          });
          return;
        });
        return;
      }
      else if (sumType === "my") {
         var query = {"startDate": {"$gte": weekAgo()},
           "userEmail": decodedToken.email
         };
      }
      else {
         responseJson.success = false;
         responseJson.message = "Invalid API request.";
         return res.status(400).json(responseJson);
      }
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }

});

module.exports = router;
