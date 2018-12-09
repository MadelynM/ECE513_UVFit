var db = require("../db");

var activitySchema = new db.Schema({
    userEmail:    String,
    activityId:   String,
    startDate:    Date,
    endDate:      Date,
    activityType: String,
    startLoc:     {type: {type: String}, 
        coordinates: {type: [Number], index: "2dsphere"}
    },
    snapshots:    [{
                      date : { type: Date, default: Date.now },
                      latitude : Number,
                      longitude : Number,
                      speed : Number,
                      uvLevel : Number
                  }]
});

activitySchema.index({startLoc: "2dsphere"});
var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
