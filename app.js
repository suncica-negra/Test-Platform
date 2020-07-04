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

mongoose.connect("mongodb+srv://username:password@cluster0-dakbl.mongodb.net/test-scoresDB", {
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
  password: String,
  loginsessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loginsession"
  }],
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test"
  }],
  dailytasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Daytask"
  }]
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
var hour = today.getHours();
var minutes1 = today.getMinutes();

var nowDate = dd + "." + (mm + 1) + "." + yyyy;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.get("/", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
    res.render("index", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("index1", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("index2", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/users/:userId", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    var reqUserId = req.params.userId;
    var userId = korisnik;
    User.findOne({
      _id: reqUserId
    }, function (err, user) {
      var name = user.name;
      var username = user.username;
      var classroom = user.classroom;
      res.render("data", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId,
        name: name,
        username: username,
        classroom: classroom
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/users/:userUsername/:userName/dailytasks", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    var reqUserUsername = req.params.userUsername;
    var userId = korisnik;
    var reqUserName = req.params.userName;
    Daytask.find({
      username: reqUserUsername
    }).sort({
      date: -1
    }).exec(function (err, daytasks) {
      res.render("data-dailytasks", {
        korisnik: korisnik,
        nowDate: nowDate,
        daytasks: daytasks,
        userId: userId,
        username: reqUserUsername,
        reqUserName: reqUserName
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/users/:userUsername/:userName/loginsesions", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    var reqUserUsername = req.params.userUsername;
    var userId = korisnik;
    var reqUserName = req.params.userName;
    Loginsession.find({
      username: reqUserUsername
    }).sort({
      dateOfLogin: -1
    }).exec(function (err, loginsessions) {
      res.render("data-loginsesions", {
        korisnik: korisnik,
        nowDate: nowDate,
        loginsessions: loginsessions,
        userId: userId,
        username: reqUserUsername,
        reqUserName: reqUserName
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/users_data/:userId", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    var reqUserId = req.params.userId;
    User.findOne({
      _id: reqUserId
    }, function (err, user) {
      var userId = user._id;
      var name = user.name;
      var username = user.username;
      var classroom = user.classroom;
      res.render("users_data1", {
        korisnik: korisnik,
        nowDate: nowDate,
        name: name,
        username: username,
        classroom: classroom,
        userId: userId
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    var reqUserId = req.params.userId;
    User.findOne({
      _id: reqUserId
    }, function (err, user) {
      var userId = user._id;
      var name = user.name;
      var username = user.username;
      var classroom = user.classroom;
      res.render("users_data2", {
        korisnik: korisnik,
        nowDate: nowDate,
        name: name,
        username: username,
        classroom: classroom,
        userId: userId
      });
    });
  }
});

app.get("/users_data/:userId/users_dailytasks", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    var reqUserId = req.params.userId;
    User.findOne({
      _id: reqUserId
    }).populate("dailytasks").exec(function (err, user) {
      Daytask.populate(user.dailytasks, {
        path: "daytasks"
      }, function (err, dailytasks) {
        user.dailytasks = dailytasks;
        for (i = 0; i < dailytasks.length; i++) {}
        res.render("users_dailytasks1", {
          korisnik: korisnik,
          nowDate: nowDate,
          userId: reqUserId,
          dailytasks: dailytasks
        });
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    var reqUserId = req.params.userId;
    User.findOne({
      _id: reqUserId
    }).populate("dailytasks").exec(function (err, user) {
      Daytask.populate(user.dailytasks, {
        path: "daytasks"
      }, function (err, dailytasks) {
        user.dailytasks = dailytasks;
        for (i = 0; i < dailytasks.length; i++) {}
        res.render("users_dailytasks2", {
          korisnik: korisnik,
          nowDate: nowDate,
          userId: reqUserId,
          dailytasks: dailytasks
        });
      });
    });
  }
});

app.get("/day-task", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("day-task1", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    var today1 = new Date();
    var today2 = today1.getDay();
    var hour2 = today1.getHours();
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("day-task2", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.post("/day-task", isLoggedIn, function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
    res.render("login", {
      korisnik: korisnik,
      nowDate: nowDate
    });
  } else {
    var korisnik = req.session.passport.user;
    var today1 = new Date();
    var today2 = today1.getDay();
    var hour2 = today1.getHours();
    if (hour2 >= 22 || hour2 < 6) {
      User.findOne({
        username: korisnik
      }, function (err, user) {
        var userId = user._id;
        res.render("NO_daily-task1", {
          korisnik: korisnik,
          nowDate: nowDate,
          userId: userId
        });
      });
    } else {
      User.findOne({
        username: korisnik
      }, function (err, user) {
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
            user.dailytasks.unshift(daytask);
            user.save();
            res.redirect("/success");
          }
        });
      });
    }
  }
});

app.get("/register", notLoggedIn, function (req, res) {
  var korisnik = "";
  res.render("register", {
    korisnik: korisnik,
    nowDate: nowDate
  });
});

app.post("/register", notLoggedIn, function (req, res) {
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
        User.findOne({
          username: korisnik
        }, function (err, user) {
          const loginsession = new Loginsession({
            username: korisnik
          });
          loginsession.save(function (err) {
            if (err) {
              req.flash("error", err.message);
              res.redirect("/");
            } else {
              user.loginsessions.unshift(loginsession);
              user.save();
              res.redirect("/");
            }
          });
        });
      });
    }
  });
});

app.get("/login", notLoggedIn, function (req, res) {
  var korisnik = "";
  res.render("login", {
    korisnik: korisnik,
    nowDate: nowDate
  });
});

app.post("/login", notLoggedIn, function (req, res) {
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
        User.findOne({
          username: korisnik
        }, function (err, user) {
          const loginsession = new Loginsession({
            username: korisnik
          });
          loginsession.save(function (err) {
            if (err) {
              req.flash("error", err.message);
              res.redirect("/login");
            } else {
              user.loginsessions.unshift(loginsession);
              user.save();
              res.redirect("/");
            }
          });
        });
      });
    }
  });
});

app.get("/users", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      User.find({}).sort({
        classroom: -1
      }).exec(function (err, users) {
        res.render("users", {
          users: users,
          korisnik: korisnik,
          nowDate: nowDate,
          userId: userId
        });
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/tests", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      Test.find({}).sort({
        date: -1
      }).exec(function (err, tests) {
        res.render("tests", {
          tests: tests,
          korisnik: korisnik,
          nowDate: nowDate,
          userId: userId
        });
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/loginsessions", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      Loginsession.find({}).sort({
        dateOfLogin: -1
      }).exec(function (err, loginsessions) {
        res.render("loginsessions", {
          loginsessions: loginsessions,
          korisnik: korisnik,
          nowDate: nowDate,
          userId: userId
        });
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/daytasks", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      Daytask.find({}).sort({
        date: -1
      }).exec(function (err, daytasks) {
        res.render("daytasks", {
          daytasks: daytasks,
          korisnik: korisnik,
          nowDate: nowDate,
          userId: userId
        });
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/probni_test", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("probni_test1", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("probni_test2", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.post("/probni_test", isLoggedIn, function (req, res) {
  var korisnik = req.session.passport.user;
  User.findOne({
    username: korisnik
  }, function (err, user) {
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
        user.tests.unshift(test);
        user.save();
        res.redirect("/success1");
      }
    });
  });
});

app.get("/error", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/success1", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
    res.render("success1", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("success1", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/success", function (req, res) {
  if (!req.session.passport) {
    var korisnik = "";
    res.render("success1", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik,
      randomPerk: korisnik
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      var perk = ["Najbolje što u životu možeš očekivati je dobra šansa.",
        "Genije je 1% inspiracije i 99% znoja. (T. A. Edison)",
        "Ni jedan uspješan čovijek nikad se nije požalio na nedostatak prilika.",
        "Onaj koji odustaje nikada ne pobjeđuje; onaj koji pobjeđuje nikada ne odustaje. (Norman Vincent Peale)",
        "Uvijek je prerano za odustajanje. (Norman Vincent Peale)",
        "Neuspjeh je uspjeh, ako učimo iz njega. (Malcolm Forbes)",
        "Tri puta vode do mudrosti: razmišljanje – ono je najplemenitije; oponašanje – on je najlakši; iskustvo – ono je najneugodnije. (Konfucije)",
        "Prepreke su one strašne stvari koje ugledaš u trenutku kada skineš oči sa svog cilja. (Henry Ford)",
        "Uspješni ljudi traže si okolinu kakvu žele. Ako je ne nađu, sami si ju stvore. (George Bernard Shaw)",
        "Važnije je činiti pravu stvar nego samo raditi nešto na pravi način. (Peter F. Drucker)",
        "Tko ne teži nadprosječnomu, tomu ni prosječno ne uspije. (Karl Heinrich Waggerl)",
        "Ciljajte prema mjesecu! Čak i ako ga promašite, završit ćete među zvijezdama. (Les Brown)",
        "Stremite k uspjehu, a ne savršenosti. Sačuvajte si pravo na pogrešku, jer ćete si tako u životu sačuvati i sposobnost učenja novih stvari i napredovanja. (David M. Burns)",
        "Želimo li postići velike stvari, moramo ne samo djelovati nego i sanjati, ne samo planirati nego i vjerovati. (Anatole France)",
        "Ne pokušavajte nadmašiti druge, već sebe. (Marko Tulije Ciceron)",
        "Uspješan čovjek je onaj koji može postaviti čvrste temelje od cigli koje bacaju na njega. (David Brink)",
        "Dvije kratke riječi koje imaju presudnu ulogu - POČNITE ODMAH! (Mary C. Crowley)",
        "Čovjek ne bi u potpunosti uživao u ljepoti i bogatstvu svoga znanja kad u njegovu stjecanju ne bi trebalo prevladati neke poteškoće. Osvajanje vrhunaca ne bi bilo ni upola lijepo kad na tom putu ne bi trebalo priječi mračne doline. (Hellen Keller)",
        "Ako nešto treba učiniti, učini to. Ne prepuštaj ništa rukama sudbine. Ne prepuštaj ništa rukama nekog tko te ne poznaje. Ti sebe najbolje poznaješ. Udahni i kreni. (Anita Baker)",
        "Ustrajati u svom poslu i šutjeti, najbolji je odgovor na svaku klevetu. (George Washington)",
        "Visoka očekivanja predstavljaju ključ svakog uspjeha. (Sam Walton)",
        "Tko hoće postati majstor mora uvijek ostati učenik. (Žarko Dolinar)",
        "Moraš napraviti baš ono što misliš da ne možeš. (Eleanor Roosevelt)",
        "Nijedno zlo ne ostaje nekažnjeno. (Menandar)",
        "Tko hoće nešto učiniti nađe način, tko neće, nađe opravdanje. (Pablo Picasso)",
        "Optužujete li druge za svoje neuspjehe, bilo bi dobro i svoje uspjehe pripisati drugima. (Howard Newton)",
        "Za odustajanje je uvijek prerano. (Norman Vincent Peale)",
        "Pokušaj izvršavati svoje obaveze pa ćeš saznati koliko vrijediš. (Johann Wolfgang von Goethe)",
        "Ako namjera nije poštena, djelo neće biti dobro. (Lucius Annaeus Seneca)",
        "Što god um uspije zamisliti to može i ostvariti. (Clement Stone)"
      ];
      var randomPerk = perk[Math.floor(Math.random() * perk.length)];
      res.render("success", {
        korisnik: korisnik,
        nowDate: nowDate,
        randomPerk: randomPerk,
        userId: userId
      });
    });
  }
});

app.get("/downloadDB-json", isLoggedIn, function (req, res) {
  const fs = require("fs");
  if (req.session.passport.user === "deaKrasnic") {
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
  }
});

app.get("/downloadDB_day-json", isLoggedIn, function (req, res) {
  const fs = require("fs");
  if (req.session.passport.user === "deaKrasnic") {
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
  }
});

app.get("/filter", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("filter", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  } else {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      res.render("error", {
        korisnik: korisnik,
        nowDate: nowDate,
        userId: userId
      });
    });
  }
});

app.get("/filterdailytask1", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      User.find({
        classroom: "1."
      }).populate("dailytasks").exec(function (err, user) {
        Daytask.populate(user.dailytasks, {
          path: "daytask"
        }, function (err, dailytasks) {
          for (i = 0; i < user.length; i++) {}
          res.render("filterdailytask1", {
            korisnik: korisnik,
            nowDate: nowDate,
            user: user,
            userId: userId
          });
        });
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/filterdailytask2", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      User.find({
        classroom: "2."
      }).populate("dailytasks").exec(function (err, user) {
        Daytask.populate(user.dailytasks, {
          path: "daytask"
        }, function (err, dailytasks) {
          for (i = 0; i < user.length; i++) {}
          res.render("filterdailytask2", {
            korisnik: korisnik,
            nowDate: nowDate,
            user: user,
            userId: userId
          });
        });
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/filterdailytask3", isLoggedIn, function (req, res) {
  if (req.session.passport.user === "deaKrasnic") {
    var korisnik = req.session.passport.user;
    User.findOne({
      username: korisnik
    }, function (err, user) {
      var userId = user._id;
      User.find({
        classroom: "3."
      }).populate("dailytasks").exec(function (err, user) {
        Daytask.populate(user.dailytasks, {
          path: "daytask"
        }, function (err, dailytasks) {
          for (i = 0; i < user.length; i++) {}
          res.render("filterdailytask3", {
            korisnik: korisnik,
            nowDate: nowDate,
            user: user,
            userId: userId
          });
        });
      });
    });
  } else {
    var korisnik = "";
    res.render("error", {
      korisnik: korisnik,
      nowDate: nowDate,
      userId: korisnik
    });
  }
});

app.get("/logout", isLoggedIn, function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running.")
});