const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //console.log('profile', profile);
        // console.log('accessToken', accessToken);
        // console.log('refreshToken', refreshToken);

        const user = {
          name: profile.displayName,
          email: profile.emails[0].value,
          fb_id: profile.id,
          access_token: accessToken,
        };

        done(null, user);
      } catch (error) {
        console.log(error);
        done(error, false, error.message);
      }
    }
  )
);
