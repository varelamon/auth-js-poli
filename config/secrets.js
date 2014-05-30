module.exports = {

  db: process.env.MONGODB|| 'mongodb://auth-poli:auth-poli@dbh83.mongolab.com:27837/auth',
 	// db: process.env.MONGODB|| 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  }
};
