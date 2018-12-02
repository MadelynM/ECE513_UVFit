var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require("request");
var Device = require("../models/device");
var jwt = require("jwt-simple");


var secret = "supersecretserverpassword";
var particleAccessToken = "d7465da69da62e7ba93d8d6d6ac27d75d860bcf0";

router.post('/setting', function(req, res, next) {
    var responseJson = {
        success: false,
        message : "",
    };
    var deviceExists = false;

    // Ensure the request includes the deviceId parameter
    if( !("deviceId" in req.body)) {
        responseJson.message = "Missing deviceId.";
        return res.status(400).json(responseJson);
    }

    // If authToken provided, use email in authToken
    try {
        var decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }

    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/settingDev",
       form: {
	       access_token : particleAccessToken,
	       args: "" +req.body.uvThreshold+" " +req.body.activity
        }
    });

    responseJson.success = true;
    responseJson.message = "Settings are posted" + req.body.deviceId+ " "+ req.body.uvThreshold+" "+ req.body.activity;
    return res.status(200).json(responseJson);
});

module.exports = router;
