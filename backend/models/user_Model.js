const mongoose = require("mongoose");

//SCHEMA
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, unique: true, required: true },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// module.exports=mongoose.model("user",userSchema);
//MODEL
const userModel=mongoose.model("user",userSchema)
module.exports =  userModel ;