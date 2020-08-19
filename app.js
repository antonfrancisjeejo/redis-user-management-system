const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");

//Create Redis Client
let client = redis.createClient();
client.on("connect", () => {
  console.log("Connected to redis");
});

const port = process.env.PORT || 3000;

const app = express();

//View Engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//methodOverride-to make delete request from the form
app.use(methodOverride("_method"));

//Search Page
app.get("/", (req, res, next) => {
  res.render("searchusers");
});

//Search processing
app.post("/user/search", (req, res) => {
  let id = req.body.id;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render("searchusers", {
        error: "User does not exist",
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj,
      });
    }
  });
});

//Add user Page
app.get("/user/add", (req, res, next) => {
  res.render("adduser");
});

//Process Add user Page
app.post("/user/add", (req, res, next) => {
  const { id, first_name, last_name, email, phone } = req.body;

  client.HMSET(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

//Delete User
app.delete("/user/delete/:id", (req, res) => {
  client.del(req.params.id);
  res.redirect("/");
});
app.listen(port, () => {
  console.log("Server started on port " + port);
});
