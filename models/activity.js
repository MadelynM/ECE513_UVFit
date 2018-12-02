var db = require("../db");

var activitySchema = new db.Schema({
    userEmail:    String,
    activityId:   String,
    startDate:    Date,
    endDate:      Date,
    activityType: String,
    snapshots:    [{
                      date : { type: Date, default: Date.now },
                      latitude : Number,
                      longitude : Number,
                      speed : Number,
                      uvLevel : Number
                  }]
});

var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
