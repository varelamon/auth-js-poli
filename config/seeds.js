var mongoose = require('mongoose');
var User = require('../models/User');
var Question = require('../models/Question');

var uristring = 'mongodb://auth-poli:auth-poli@dbh83.mongolab.com:27837/auth'

mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);

		var user = new User({
		  email: 'admin@admin.com',
		  password: 'adminadmin',
		  username: 'admin',
		  name: 'adminitrador',
		  admin: true
		});



		user.save(function(err) {
		  if (err) return console.log(err);
		});

		var test1 = new User({
		  email: 'test1@test1.com',
		  password: 'test1',
		  username: 'test1',
		  name: 'test 1'
		});

		test1.save(function(err) {
		  if (err) return console.log(err);
		});

		var test2 = new User({
		  email: 'test2@test2.com',
		  password: 'test2',
		  username: 'test2',
		  name: 'test 2'
		});

		test2.save(function(err) {
		  if (err) return console.log(err);
		});

		console.log ("Finish Users seed");

		// Questions Seeds

		questions = [
			'Cual es nombre de tu primera mascota?',
			'Cual es nombre de tu primera escuela?',
			'Cual es nombre de tu ultimo novio o novia ?',
			'Cual es nombre de la profesion de tu abuelo paterno?',
			'Cual es nombre de la profesion de tu abuela materna?'
		]

		for (var i = questions.length - 1; i >= 0; i--) {
			var question = new Question({ text: questions[i]});
			question.save(function(err) {
			  if (err) return console.log(err);
			});
		};
		console.log ("Finish Questiion seed");







  }
});



