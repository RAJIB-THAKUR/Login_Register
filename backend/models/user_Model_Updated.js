const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;

const userSchema = new mongoose.Schema({
  // _id: ObjectId,
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  details: [
    {
      year: {
        type: String,
        required: true,
      },
      month: {
        type: String,
        required: true,
      },
      day: {
        type: String,
        required: true,
      },
      expense: [
        {
          type: {
            type: String,
            required: true,
          },
          val: {
            type: Number,
            required: true,
          },
          info: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
  
});

const Expense = mongoose.model("expenses2", userSchema);
module.exports =  Expense;