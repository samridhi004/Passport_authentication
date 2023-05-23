require("dotenv").config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth")
require("./db/conn");
const User = require("./models/register");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.set("views","views")
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/secret",auth, (req, res) => {
  //console.log(`my cookie is ${req.cookies.jwt}`);
  res.render("secret");
});
app.get("/logout",auth,async (req,res)=>{
  try {
    console.log(req.user)
    // single logout
    // req.user.tokens = req.user.tokens.filter((current)=>{
    //   return current.token != req.token
    // })

    //multiple device logout
    req.user.tokens = []
    res.clearCookie("jwt")
    console.log("logout succesfully")
    await req.user.save()
    res.render("login")
  } catch (error) {
    res.status(404).send(error)
  }
})
app.post("/", async (req, res) => {
  try {
    const pass = req.body.password;
    const cpass = req.body.cpassword;

    if (pass === cpass) {
      const user = new User(req.body);

      console.log("success part " + user);

      const token = await user.generateAuthToken();
      console.log("token part " + token);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000),
        httpOnly: true,
      });
      console.log(cookie);
      const registered = await user.save();
      console.log("part page" + registered);
      res.status(201).render("login");
    } else {
      res.send("password not matched");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const pass = req.body.password;
    const userMail = await User.findOne({ email: email });

    const isMatch = await bcrypt.compare(pass, userMail.password);

    const token = await userMail.generateAuthToken();
    console.log("token part " + token);
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60000),
      httpOnly: true,
      //secure:true for https connetion
    });
    if (isMatch) {
      res.status(201).send("login succesfully");
    } else {
      res.status(400).send("invalid email or password");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
