const express = require("express");
const router = express.Router();

// const User = require("../models/user_Model");
const User = require("../models/user_Model_Updated");

//To Validate User-Inputs
const { body, validationResult } = require("express-validator");

//To Encrypt Passwords
const bcrypt = require("bcryptjs");

//To Generate tokens on user-login
const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

//-------------------------------------ROUTES----------------------------

//ROUTE-1: "register" user
router.post(
  "/register",
  //Adding validation for the input fields
  [
    body("name", "Enter Valid Name").isLength({ min: 3 }),
    body("email", "Enter Valid Email").isEmail(),
    body("mobile", "Enter Valid Phone Number").isLength({
      min: 1,
    }),
    body("password", "Password must be of minimun 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, error: errors.array() });
    }
    const { name, email, mobile, password } = req.body;

    try {
      const oldUser = await User.findOne({ email });

      if (oldUser) {
        return res.status(400).json({
          status: 400,
          error: [{ msg: "User Already Exists with this email" }],
        });
      }
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      //   const encryptedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        mobile,
        password: encryptedPassword,
      });
      res.send({ status: 200 });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: 500,
        error: "Couldn't sign up\nSOMETHING WENT WRONG\nInternal Server Error",
      });
    }
  }
);

//ROUTE-2: "login" user
router.post(
  "/login-user",
  [
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password must be of minimun 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, error: errors.array() });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 400,
        error: [{ msg: "User Not Found \nGet yourself Registered first" }],
      });
    }
    // if ((await password) === user.password)
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET);
      // console.log(token);

      //Verification
      // const verifiedData = jwt.verify(token, JWT_SECRET);
      // console.log(verifiedData);

      if (res.status(201)) {
        return res.json({ status: 201, data: token });
      } else {
        return res.json({
          status: 400,
          error: [{ msg: "Some Error Ocurred\nTry Again" }],
          // error: "Some Error Ocurred\nTry Again",
        });
      }
    }
    res.json({ status: 400, error: [{ msg: "Invalid Password" }] });
  }
);

//ROUTE-3:Get logged-in user "userData"
router.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log(token);
    console.log(user);
    const userEmail = user.email;
    User.findOne({ email: userEmail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "ok", data: error });
      });
  } catch (error) {res.send({ status: "Failed", data: error });}
});

//ROUTE-4:Add Expense for any day
router.post("/add_User_Expense_Daily", async (req, res) => {
  try {
    const { token, year, month, day, field, value } = req.body;
    // console.log(req.body);
    const email = jwt.verify(token, JWT_SECRET).email;
    User.findOne(
      {
        email: email,
        details: { $elemMatch: { year: year, month: month, day: day } },
      },
      async (err, user) => {
        // console.log("2");
        // console.log(user);
        if (user) {
          // console.log("3");
          User.updateOne(
            {
              email: email,
              details: { $elemMatch: { year: year, month: month, day: day } },
            },
            { $push: { "details.$.expense": { type: field, val: value } } },
            async (error, ans) => {
              if (error) res.send(error);
              else {
                console.log(ans);
                res.send({ message: "successfully stored", ans });
              }
            }
          );
        } else {
          // console.log("4");
          User.updateOne(
            { email: email },
            {
              $push: {
                details: {
                  year: year,
                  month: month,
                  day: day,
                  expense: [{ type: field, val: value }],
                },
              },
            },
            async (error, ans) => {
              if (error) res.send(error);
              else {
                // console.log("5");
                console.log(ans);
                res.send({ message: "successfully stored", ans });
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
});

//ROUTE-5:Fetch total expense for a day
router.post("/fetch_User_Expense_Sum_Daily", async (req, res) => {
  try {
    const { token, year, month, day } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;
    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      {
        $match: {
          "details.year": year,
          "details.month": month,
          "details.day": day,
        },
      },
      { $unwind: "$details.expense" },
      {
        $group: {
          _id: "$details.day",
          sum: { $sum: "$details.expense.val" },
        },
      },
    ]).exec((err, daily_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(daily_Expense);
      }
    });
  } catch (err) {
    // res.send(err);
    console.log(err);
  }
});

//ROUTE-6:Fetch total expense for a month
router.post("/fetch_User_Expense_Sum_Monthly", async (req, res) => {
  try {
    const { token, year, month } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;
    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      { $match: { "details.year": year, "details.month": month } },
      { $unwind: "$details.expense" },
      {
        $group: {
          _id: "$details.month",
          sum: { $sum: "$details.expense.val" },
        },
      },
    ]).exec((err, monthly_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(monthly_Expense);
      }
    });
  } catch (err) {
    // res.send(err);
    console.log(err);
  }
});

//ROUTE-7:Fetch total expense for a year
router.post("/fetch_User_Expense_Sum_Yearly", async (req, res) => {
  try {
    const { token, year } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;

    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      { $match: { "details.year": year } },
      { $unwind: "$details.expense" },
      {
        $group: {
          _id: "$details.month",
          sum: { $sum: "$details.expense.val" },
        },
      },
    ]).exec((err, yearly_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(yearly_Expense);
      }
    });
  } catch (err) {
    // res.send(err);
    console.log(err);
  }
});

//ROUTE-8:Fetch all expense details for a given day
router.post("/fetch_User_Expense_Details_Daily", async (req, res) => {
  try {
    const { token, year, month, day } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;

    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      {
        $match: {
          "details.year": year,
          "details.month": month,
          "details.day": day,
        },
      },
      { $project: { _id: 0, "details.day": 1, "details.expense": 1 } },
    ]).exec((err, yearly_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(yearly_Expense);
      }
    });
  } catch (err) {
    // res.send(err);
    console.log(err);
  }
});

//ROUTE-9:Fetch day-wise expense for a given month
router.post("/fetch_User_Expense_Details_Monthly", async (req, res) => {
  try {
    const { token, year, month } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;
    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      { $match: { "details.year": year, "details.month": month } },
      { $unwind: "$details.expense" },
      {
        $group: {
          _id: "$details.day",
          sum: { $sum: "$details.expense.val" },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec((err, monthly_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(monthly_Expense);
      }
    });
    // .toArray((error, ans) => {
    //   if (error) res.send({ error: error.message });
    //   if (ans.length) {
    //     res.json(ans);
    //   } else res.send({ data: "no doc found" });
    // });
  } catch (err) {
    // res.send(err);
    console.log(err);
  }
});

//ROUTE-10:Fetch month-wise expense for a given year
router.post("/fetch_User_Expense_Details_Yearly", async (req, res) => {
  try {
    const { token, year } = req.body;
    const email = jwt.verify(token, JWT_SECRET).email;
    const f = User.aggregate([
      { $match: { email: email } },
      { $unwind: "$details" },
      { $match: { "details.year": year } },
      { $unwind: "$details.expense" },
      {
        $group: {
          _id: "$details.month",
          sum: { $sum: "$details.expense.val" },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec((err, yearly_Expense) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ message: "Failure" }));
        res.sendStatus(500);
      } else {
        res.send(yearly_Expense);
      }
    });
  } catch (err) {
    res.send(err);
    // console.log(err);
  }
});

//Using .exec/callback to solve toArray() function issue

module.exports = router;