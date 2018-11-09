var db = require("../db");

var activitySchema = new db.Schema({
    userEmail:    String,
    activityId:   String,
    snapshots:    [{
                      date : { type: Date, default: Date.now },
                      latitude : Number,
                      longitude : Number,
                      uvLevel : Number
                  }]
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
