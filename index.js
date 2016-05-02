var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here
app.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.json(users);
    });
});

app.get('/users/:userId', function(req, res) {
    User.findOne({
        _id: req.params.userId
    }, function(err, user) {
        if(!user) {
          return res.sendStatus(404);
      }
        if (err) {
            return res.sendStatus(500);
        }

        return res.json(user);
    });
});

app.post('/users', jsonParser, function(req, res) {
    if (!req.body.username) {
      // return res.sendStatus(422);
      var message = {
        message: 'Missing field: username'
      }
      return res.status(422).json(message)
    }

    if (typeof req.body.username != 'string' ){
        var message2 = { message: 'Incorrect field type: username'}

      return res.status(422).json(message2)
    }

    var user = new User({
        username: req.body.username
    });

    user.save(function(err, user) {
      res.body= {}
        if (err) {
            return res.sendStatus(500);
        }

        return res.status(201).location('/users/' + user._id).json({});
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    if (!req.body.username) {
      // return res.sendStatus(422);
      var message = {
        message: 'Missing field: username'
      }
      return res.status(422).json(message)
    }
    if (typeof req.body.username != 'string' ){
        var message2 = { message: 'Incorrect field type: username'}

      return res.status(422).json(message2)
    }
    var newUser = req.body;
    User.findByIdAndUpdate(req.params.userId, newUser, {upsert:true}, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).json({});
    })
});

// app.delete('/users/:userId', jsonParser, function(req, res) {
//    User.findByIdAndRemove(req.params.userId, function(err, user) {
//         console.log(user);
//        if (err) {
//          return res.sendStatus(500);
//        }
//        if (user == null) {
//          return res.status(404).json({message: 'User not found'});
//        }
//        return res.status(200).json({});
//    });
// });

app.delete('/users/:userId', function(req, res) {
  User.findByIdAndRemove({
    _id: req.params.userId
  }).then(function(user) {
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    return res.status(200).json({});
  }).catch(function(err) {
    return res.sendStatus(500);
  });
});

var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
mongoose.connect(databaseUri).then(function() {
    app.listen(8080, function() {
        console.log('Listening on localhost:8080');
    });
});

module.exports = app;
