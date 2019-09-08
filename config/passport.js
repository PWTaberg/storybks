const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

// Load model
const GoogleUser = mongoose.model('google_users');

module.exports = function(passport)  {
  passport.use(
    new GoogleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    }, (accessToken, refreshToken, profile, done) => {
      
      // Cut off the size part of the photo - did not exist ...
      const image = profile.photos[0].value;
            
      const newGoogleUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        image: image
      }
      
      // Check for existing user
      GoogleUser.findOne({
        googleID: profile.id
      }).then(google_user => {

        // check if user exists
        if (google_user) {
          // user exists
          done(null, google_user);
        } else {
          // create user
          new GoogleUser (newGoogleUser)
            .save()
            .then(google_user => { 
              done(null, google_user)
            });
        }
      }).catch(err => {
        console.log("passport, findOne");
        console.log(err);
      })
    })
  )

  passport.serializeUser((google_user, done) => {
    done(null, google_user.id);
  });

  passport.deserializeUser((id, done) => {
    GoogleUser.findById(id).then(google_user => { 
      done(null, google_user)
    });
  });
}