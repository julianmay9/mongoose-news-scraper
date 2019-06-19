// NPM Packages
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var PORT =  process.env.PORT || 8080;

var app = express();

// Middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/headlines";
// Enable JavaScript ES6 Promises
mongoose.Promise = Promise;
mongoose.connect(
  MONGODB_URI
);

// Global results array
var results = [];

// Routes

app.get("/", function(req, res) {
    res.render("index");
});

// GET route for scraping the Guardian website
app.get("/scrape", function(req, res) {
  var found;
  var headlines = [];
    db.Article.find({})
      .then(function(dbArticle) {
        for (var num = 0; num < dbArticle.length; num++) {
          headlines.push(dbArticle[num].title)
        }
        console.log(headlines);
    request("https://www.theguardian.com/us/", function(error, response, html) {
    if (!error && response.statusCode == 200) {

    }
    var $ = cheerio.load(html, {
      xml: {
        normalizeWhitespace: true,
      }
    })
    $("a.js-headline-text").each(function(i, element) {
      var result = {};
      result.title = $(element).text();
      found = headlines.includes(result.title);
      result.link = $(element).attr("href");
      if (!found && result.title && result.link){
        results.push(result);
      }
    });
      res.render("scrape", {
      articles: results
    });
  })
});
});

// GET route for retrieving all Articles from the db
app.get("/saved", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.render("saved", {
        saved: dbArticle
      });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// POST route for creating an article in the db
app.post("/api/saved", function(req, res) {
  db.Article.create(req.body)
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET route for grabbing a specific article by its id and populating it with its note
app.get("/articles/:id", function(req, res) {
  console.log(req.params.id);
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      console.log(dbArticle);
      if (dbArticle) {
      res.render("articles", {
        data: dbArticle
      });
    }
    })
    .catch(function(err) {
      res.json(err);
    });
});

// DELETE route for deleting an article from the db
app.delete("/saved/:id", function(req, res) {
  db.Article.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
        res.json(err);
    });
});

// DELETE route for deleting a note
app.delete("/articles/:id", function(req, res) {
  db.Note.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
        res.json(err);
    });
});

// POST route for updating an article's note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: dbNote._id }}, { new: true })
      .then(function(dbArticle) {
        console.log(dbArticle);
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
    })
    .catch(function(err) {
      res.json(err);
    })
});

// Start the server!
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
