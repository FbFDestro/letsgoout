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
        console.log('profile', profile);
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);

        /*
        const existingUser = await User.findOne({ 'facebook.id': profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = new User({
          method: 'facebook',
          facebook: {
            id: profile.id,
            email: profile.emails[0].value,
          },
        });

        await newUser.save();
        */

        const user = {
          rola: 'mamaminha',
        };
        done(null, user);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
