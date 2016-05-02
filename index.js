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

app.post('/users', jsonParser, function(req, res) {
    if (!req.body.username) {
      // return res.sendStatus(422);
      var message = {
        message: 'Missing field: username'
      }
      console.log('the message', message);
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
        if (err) {
            return res.sendStatus(500);
        }

        return res.status(201).location('/users/' + user._id).json({});
    });
});


app.get('/users/:userId', function(req, res) {
    User.findOne({
        _id: req.params.userId
    }, function(err, user) {
        if (err) {
            return res.sendStatus(500);
        }
        var message3 = {message: 'User not found'};
        if(!user) {
            return res.status(404).json(message3);
        }

        return res.json(user);
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    var newUser = req.body;
    User.findByIdAndUpdate(req.params.userId, newUser, function(err) {
        if (err) {
            return res.sendStatus(500);
        }
        return res.status(200).json({});
    })
});

app.delete('/users/:userId', jsonParser, function(req, res) {
   User.findByIdAndRemove(req.params.userId, function(err, user) {
       if (err) {
         return res.sendStatus(500);
       }
       if (!user) {
         return res.status(404).json({message: 'User not found'});
       }
       return res.status(200).json({});
   });
});

var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
mongoose.connect(databaseUri).then(function() {
    app.listen(8080, function() {
        console.log('Listening on localhost:8080');
    });
});

module.exports = app;
