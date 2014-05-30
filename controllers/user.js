var _ = require('underscore');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var Question = require('../models/Question');
var secrets = require('../config/secrets');


/**
 * GET /users
 * users page.
 */

exports.getUsers = function(req, res) {
  if (!req.user.admin) return res.redirect('/');
  User.find(function(err, users) {
    res.render('users/index', { users: users });
  });
};

/**
 * GET /user/:id
 * user page.
 */

exports.getUser = function(req, res) {
  if (!req.user.admin) return res.redirect('/');
  User.findOne({ username: req.params.username }, function(err, user) {
    res.render('users/show', { user: user });
  });
};

/**
 * post /user/:id
 * delete user.
 */

exports.deleteUser = function(req, res) {
  if (!req.user.admin) return res.redirect('/');
  User.remove({ _id: req.params.id }, function(err) {
    if (err) return next(err);
    req.flash('success', { msg: 'Usuario borrado exitosamente' });
    res.redirect('/users');
  });
};


/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
 */

exports.postLogin = function(req, res, next) {
  req.assert('username', 'Nombre de usuario no puede estar en blanco').notEmpty();
  req.assert('password', 'Contraseña no puede estar en blanco').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Has iniciado sesion correctamente.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');

  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };
  Question.find(function(err, questions) {
    var questionsArray = [];
    questionsArray = shuffle(questions);
    res.render('account/signup', { questions: questionsArray });
  });
};

/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postSignup = function(req, res, next) {
  req.assert('email', 'Correo no es valido').isEmail();
  req.assert('password', 'Contraseña debe tener minimo 16 caracteres').len(16);
  req.assert('username', 'El nombre de usuario debe tener minimo 4 caracteres').len(4);
  req.assert('username', 'El nombre debe tener minimo 4 caracteres').len(4);
  req.assert('confirmPassword', 'Las  contraseñas no concuerdan').equals(req.body.password);

  req.assert('answer1', 'Las respuestas de seguridad  deben tener minimo 3 caracteres').len(3);
  req.assert('answer2', 'Las respuestas de seguridad  deben tener minimo 3 caracteres').len(3);
  req.assert('answer3', 'Las respuestas de seguridad  deben tener minimo 3 caracteres').len(3);
  var errors  = req.validationErrors();



  regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[ ! @ # $ % ^ & * ( ) _ - + =])/
  if (!regex.test(req.body.password)){
    if (errors == null)
      errors = []
    errors.push({ param: 'password', msg: 'La Contraseña debe incluir almenos una letra mayuscula, una miniscula, un numero y un caracter especial', value: '' });
  }

  if (errors && errors.length > 0) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var questions = [
    {text: req.body.question1, answer: req.body.answer1},
    {text: req.body.question2, answer: req.body.answer2},
    {text: req.body.question3, answer: req.body.answer3}
  ]


  var user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    name: req.body.name,
    questions: questions

  });


  User.findOne({$or: [{ email: req.body.email }, { username: req.body.username }]}, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Ya existe una cuenta con ese email o nombre de usuario.' });
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) return next(err);
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */

exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.email = req.body.email || '';
    user.name = req.body.name || '';

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Cuenta actualizada correctamente' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param password
 */

exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Contraseña debe tener minimo 8 caracteres').len(8);
  req.assert('confirmPassword', 'Las contraseñas deben de coincidir').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Su Contraseña ha sido actualizada conrrectamente.'});
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 * @param id - User ObjectId
 */

exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth2 provider from the current user.
 * @param provider
 * @param id - User ObjectId
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */

exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Token invalido o ha expirado.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */

exports.postReset = function(req, res, next) {
  req.assert('password', 'Contraseña debe tener almenos 16 caracteres.').len(16);
  req.assert('confirm', 'Las contraseñas deben coincidir.').equals(req.body.password);

  var errors = req.validationErrors();

  regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[ ! @ # $ % ^ & * ( ) _ - + =])/
  if (!regex.test(req.body.password)){
    if (errors == null)
      errors = []
    errors.push({ param: 'password', msg: 'La Contraseña debe incluir almenos una letra mayuscula, una miniscula, un numero y un caracter especial', value: '' });
  }

  if (errors && errors.length > 0) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Token es invalido o ha expirado.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'no-reply@auth.com',
        subject: 'Cambio de contraseña',
        text: 'Hola,\n\n' +
          'Este correo es para confirmarte que la contraseña para tu cuenta ' + user.email + ' ha cambiado.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Tu contraseña ha cambiado exitosamente.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */

exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email
 */

exports.postForgot = function(req, res, next) {
  req.assert('email', 'Porfavor entre una direccion de correo valida.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No existe ninguna cuenta con este correo.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: secrets.sendgrid.user,
          pass: secrets.sendgrid.password
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'no-reply@auth.com',
        subject: 'Reseteo de contraseña',
        text: 'Alguien solicito un enlace para cambiar tu contraseña, puedes realizar esto medio el siguiente enlance.\n\n' +

          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Si tu no solicitaste este cambio, ignora este correo.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'Un correo ha sido enviado a  ' + user.email + ' con instrucciones de reseteo.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */

exports.getAnswers = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  var username = req.query.username;

  User.findOne({ username: username }, function(err, user) {
    if (!user) {
      req.flash('errors', { msg: 'No existe ninguna cuenta con este nombre usuario.' });
      return res.redirect('/forgot');
    }

    res.render('account/answers', {
      title: 'Generar Preguntas',
      username: username,
      questions: user.questions
    });

  });


};



/**
 * POST /answers
 * @param username
 */

exports.postAnswers = function(req, res, next) {
  var result = {verify: true, bad: [], good: []};
  var questions = [
    {text: req.body.question1, answer: req.body.answer1},
    {text: req.body.question2, answer: req.body.answer2},
    {text: req.body.question3, answer: req.body.answer3}
  ]

  User.findOne({ username: req.body.username }, function(err, user) {
    questionsDB = user.questions;

    for (var i = 0; i < questions.length; i++) {
      q = questions[i];
      for (var j = 0; j < questionsDB.length; j++) {
        qdb = questionsDB[j];
        if (q.text == qdb.text)
          if (q.answer == qdb.answer){
            console.log("good -->"+q.text + " "+qdb.text);
            result.good.push(q.answer);
            console.log(result.good);
            break;
          }
          else{
            console.log("bad -->"+q.text + " "+qdb.text);
            result.bad.push(q.answer);
            result.verify = false;
          }

        };
      };
    res.json(result);


  });

};


















