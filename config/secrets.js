module.exports = {

  db: process.env.MONGODB|| 'mongodb://auth-poli:auth-poli@dbh83.mongolab.com:27837/auth',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  }
};
