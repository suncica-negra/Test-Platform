const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const request = require("request");
const methodOverride = require("method-override");
const flash = require('connect-flash');

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

app.use(session({
  secret: "Naša mala tajna.",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.messages = req.flash();
  next();
});

mongoose.connect("mongodb+srv://<password>@cluster0-dakbl.mongodb.net/test-scoresDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    unique: true
  },
  classroom: String,
  password: String
});

const loginsessionSchema = new mongoose.Schema({
  username: String,
  dateOfLogin: {
    type: Date,
    default: Date.now
  }
});

const testSchema = new mongoose.Schema({
  username: String,
  odgovor1: String,
  odgovor2: String,
  odgovor3a: String,
  odgovor3b: String,
  odgovor3c: String,
  odgovor3d: String,
  odgovor3e: String,
  odgovor3f: String,
  odgovor4: String,
  odgovor5: String,
  odgovor6: String,
  odgovor7a: String,
  odgovor7b: String,
  odgovor7c: String,
  odgovor7d: String,
  odgovor7e: String,
  odgovor8: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const daytaskSchema = new mongoose.Schema({
  username: String,
  daytask: String,
  kod: String,
  date: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator);

const User = new mongoose.model("User", userSchema);
const Test = new mongoose.model("Test", testSchema);
const Loginsession = new mongoose.model("Loginsession", loginsessionSchema);
const Daytask = new mongoose.model("Daytask", daytaskSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var today = new Date();
var dd = today.getDate();
var mm = today.getMonth();
var yyyy = today.getFullYear();

var nowDate = dd + "." + (mm + 1) + "." + yyyy;


app.get("/", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("index", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    res.render("index1", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("index2", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.get("/day-task", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    res.render("day-task1", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("day-task2", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.post("/day-task", function (req, res) {
  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;

    const daytask = new Daytask({
      username: req.session.passport.user,
      daytask: req.body.daytask,
      kod: req.body.kod

    });

    daytask.save(function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        res.redirect("/logout");
      }
    });
  }
});

app.get("/register", function (req, res) {
  var korisnik = "";
  res.render("register", {
    korisnik: korisnik,
    nowDate: nowDate
  });
});

app.post("/register", function (req, res) {

  const newUser = new User({
    username: req.body.username,
    name: req.body.name,
    classroom: req.body.classroom,
  });

  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {

        var korisnik = req.session.passport.user;
        const loginsession = new Loginsession({
          username: korisnik
        });

        loginsession.save(function (err) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      });
    }
  });
});

app.get("/login", function (req, res) {
  var korisnik = "";
  res.render("login", {
    korisnik: korisnik,
    nowDate: nowDate
  });
});

app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function () {
        var korisnik = req.session.passport.user;

        const loginsession = new Loginsession({
          username: korisnik
        });

        loginsession.save(function (err) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/");
          } else {
            res.redirect("/");
          }
        });
      });
    }
  });
});


app.get("/users", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;

    User.find({}).sort({
      classroom: -1
    }).exec(function (err, users) {
      res.render("users", {

        users: users,
        korisnik: korisnik,
        nowDate: nowDate

      });
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("/", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.get("/tests", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });

  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;

    Test.find({}).sort({
      date: -1
    }).exec(function (err, tests) {
      res.render("tests", {

        tests: tests,
        korisnik: korisnik,
        nowDate: nowDate

      });
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("/", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.get("/loginsessions", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;

    Loginsession.find({}).sort({
      dateOfLogin: -1
    }).exec(function (err, loginsessions) {
      res.render("loginsessions", {

        loginsessions: loginsessions,
        korisnik: korisnik,
        nowDate: nowDate

      });
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("/", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.get("/daytasks", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;

    Daytask.find({}).sort({
      date: -1
    }).exec(function (err, daytasks) {
      res.render("daytasks", {

        daytasks: daytasks,
        korisnik: korisnik,
        nowDate: nowDate

      });
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("/", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});


app.get("/probni_test", function (req, res) {

  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    res.render("probni_test1", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;
    res.render("probni_test2", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  }
});

app.post("/probni_test", function (req, res) {
  if (req.session.passport === undefined) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;

    const test = new Test({
      username: req.session.passport.user,
      odgovor1: req.body.prvo,
      odgovor2: req.body.drugo,
      odgovor3a: req.body.trece,
      odgovor3b: req.body.trece1,
      odgovor3c: req.body.trece2,
      odgovor3d: req.body.trece3,
      odgovor3e: req.body.trece4,
      odgovor3f: req.body.trece5,
      odgovor4: req.body.cetvrto,
      odgovor5: req.body.peto,
      odgovor6: req.body.sesto,
      odgovor7a: req.body.sedmo,
      odgovor7b: req.body.sedmo1,
      odgovor7c: req.body.sedmo2,
      odgovor7d: req.body.sedmo3,
      odgovor7e: req.body.sedmo4,
      odgovor8: req.body.kod
    });

    test.save(function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        res.redirect("/logout");
      }
    });
  }
});


app.get("/error", function (req, res) {
  var korisnik = "";
  res.render("error", {
    korisnik: korisnik,
    nowDate: nowDate
  });
});


app.get("/downloadDB-json", function (req, res) {
  const fs = require("fs");

  Test.find().sort({
    date: -1
  }).exec(function (err, output) {

    var jsonOutput = JSON.stringify(output, null, '\t')

    fs.writeFile('x.json', output, function (err) {
      if (err) {
        console.log(err)
        res.send('error')
      } else {
        var filename = 'testovi.json'
        var mimetype = 'application/json'
        res.setHeader('Content-disposition', 'attachment; filename=' + filename)
        res.setHeader('Content-type', mimetype)
        res.end(jsonOutput)
      }
    })
  });
});


app.get("/downloadDB_day-json", function (req, res) {
  const fs = require("fs");

  Daytask.find().sort({
    date: -1
  }).exec(function (err, output) {

    var jsonOutput = JSON.stringify(output, null, '\t')

    fs.writeFile('x.json', output, function (err) {
      if (err) {
        console.log(err)
        res.send('error')
      } else {
        var filename = 'dnevni_testovi.json'
        var mimetype = 'application/json'
        res.setHeader('Content-disposition', 'attachment; filename=' + filename)
        res.setHeader('Content-type', mimetype)
        res.end(jsonOutput)
      }
    })
  });
});


app.get("/logout", function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running.")
});