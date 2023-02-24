const express = require("express");
const app = express();
const mongoose = require("mongoose");
//mechanism implemented in web browsers to allow or deny requests coming from a different domain to your web app.
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const User = require("./backend/models/user_Model");
// import User from "./models/user_Model";

mongoose.set("strictQuery", false);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
//View engines allow us to render web pages using template files. These templates are filled with actual data and served to the client.
app.set("view engine", "ejs");

const PORT = 3100;

//For encrypting our password
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
// var nodemailer = require("nodemailer");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

// const mongoUrl =
//   "mongodb+srv://adarsh:adarsh@cluster0.zllye.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect("mongodb://localhost:27017/myLoginRegisterDB", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   mobile: String,
//   password: String,
// });
// const userSchema=new mongoose.Schema(Schema);
// const User = new mongoose.model("User", userSchema);

app.post(
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
      // console.log(typeof(errors));
      return res.status(400).json({ status: 400, error: errors.array() });
      //   return res.status(400).json({ status: 400, error: errors });
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

app.post(
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

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log(user);
    const userEmail = user.email;
    User.findOne({ email: userEmail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "ok", data: error });
      });
    // console.log(user);
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`Server is working on port: http://localhost:${PORT}`);
});

// module.exports=PORT;
/*
app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await password === user.password) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    if (res.status(201)) {
      //  alert("Ami Valid");
       res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});
*/
