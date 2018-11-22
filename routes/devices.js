var express = require('express');
var router = express.Router();
var fs = require('fs');
var Device = require("../models/device");
var jwt = require("jwt-simple");

/* Authenticate user */
var secret = "supersecretserverpassword";

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 32; i++) {
       newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}

// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
    var deviceId = req.params.devid;
    var responseJson = { devices: [] };

    if (deviceId == "all") {
      var query = {};
    }
    else {
      var query = {
          "deviceId" : deviceId
      };
    }

    Device.find(query, function(err, allDevices) {
      if (err) {
        var errorMsg = {"message" : err};
        res.status(400).json(errorMsg);
      }
      else {
         for(var doc of allDevices) {
            responseJson.devices.push({ "deviceId": doc.deviceId,  "lastContact" : doc.lastContact});
         }
      }
      res.status(200).json(responseJson);
    });
});

//req.body = JSON.parse(JSON.stringify(req.body));

router.post('/register', function(req, res, next) {
    var responseJson = {
        registered: false,
        message : "",
        apikey : "none"
    };
    var deviceExists = false;

    // Ensure the request includes the deviceId parameter
    if(!("deviceId" in req.body)) {  //!req.body.hasOwnProperty("deviceId")
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }

    var email = "";

    // If authToken provided, use email in authToken
    if (req.headers["x-auth"]) {
        try {
            var decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
        }
        catch (ex) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    }
    else {
        // Ensure the request includes the email parameter
        if( !("email" in req.body)) {
            responseJson.message = "Invalid authorization token or missing email address.";
            return res.status(400).json(responseJson);
        }
        email = req.body.email;
    }

    // See if device is already registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
            responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
            return res.status(400).json(responseJson);
        }
        else {
            // Get a new apikey
             deviceApikey = getNewApikey();

             // Create a new device with specified id, user email, and randomly generated apikey.
            var newDevice = new Device({
                deviceId: req.body.deviceId,
                userEmail: email,
                apikey: deviceApikey
            });

            // Save device. If successful, return success. If not, return error message.
            newDevice.save(function(err, newDevice) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    // This following is equivalent to:
                    //     res.status(400).send(JSON.stringify(responseJson));
                    return res.status(400).json(responseJson);
                }
                else {
                    responseJson.registered = true;
                    responseJson.apikey = deviceApikey;
                    responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
                    return res.status(201).json(responseJson);
                }
            });
        }
    });
});



router.put('/replace', function(req, res, next) {
    var responseJson = {
        replaced: false,
        message : "",
        apikey : "none",
    };


    var email = "";
  // If authToken provided, use email in authToken
    if (req.headers["x-auth"]) {
        try {
            var decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
        }
        catch (ex) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    }
    else {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);

    }
     deviceApikey = getNewApikey();


   Device.findOne({ deviceId: req.body.deviceNew }, function(err, device) {
         if (device !== null) {
             responseJson.message = "Device ID " + req.body.deviceNew + " already registered.";
             return res.status(400).json(responseJson);
         }
         else {

    Device.update({userEmail:email, deviceId: req.body.deviceOld},
       { deviceId: req.body.deviceNew , apikey:deviceApikey },
       { multi: false },
       function(err, sta) {
         if (err){
           responseJson.message = "Error communicating with database.";
            res.status(401).json(responseJson);
            return;
         }
         else if (!sta){
           responseJson.message = "The email or password provided was invalid.";
            res.status(401).json(responseJson);
            return;
         }
         else {
              if (sta.nModified != 0){
           responseJson.replaced = true;
           responseJson.apikey = deviceApikey;
           responseJson.message = "Device with ID " + req.body.deviceOld + " has been replaced with new device.";
           return res.status(201).json(responseJson);
         }
         else {
           responseJson.message = "Device with ID " + req.body.deviceOld + " does not exist.";
            res.status(401).json(responseJson);
            return;
         }
        //  console.log("Documents updated: " + status.nModified);
           }
       });
     }
});

    });


module.exports = router;
