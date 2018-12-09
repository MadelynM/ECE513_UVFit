var db = require("../db");

var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
  passwordHash: String,
  lastAccess:   { type: Date, default: Date.now },
  userDevices:  [ String ],
  userLoc: {
    type: {type: String, index: true},
    coordinates: {type: [Number], index: '2dsphere'}
  },
  active:  {type:Boolean, required: true, default: false },
  tempToken: { type:String, required: true}
});

var User = db.model("User", userSchema);

module.exports = User;
