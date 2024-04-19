import express from 'express';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import dotenv from 'dotenv';
import session from 'express-session';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const linkedinStrategy = new OAuth2Strategy({
  authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/linkedin/callback",
  scope: ['openid','profile','email','w_member_social'],
  state: false
},
function(accessToken, refreshToken, profile, done) {
  console.log(accessToken);
  done(null, accessToken);
});

passport.use(linkedinStrategy);

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user); 
});

passport.deserializeUser((obj, done) => {
  done(null, obj); 
});

app.get('/auth/linkedin', passport.authenticate('oauth2'));

app.get('/auth/linkedin/callback',
  passport.authenticate('oauth2', { successRedirect: '/', failureRedirect: '/' })
);

app.get('/', (req, res) => {
  const accessToken = req.session.passport.user;
  if (!accessToken) {
    res.send('Access token not found in session.');
  } else {
    res.send(`Access token: ${accessToken}`);
  }
});


const getLinkedInUserID = async (accessToken) => {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log(response.data);
    return response.data.sub;
  } catch (error) {
    console.error('Error fetching LinkedIn user ID:', error.response.data);
    return null;
  }
};
app.get('/post-on-linkedin', async (req, res) => {
  const accessToken = 'AQU_TaUqinHbljvkvvpE1j3SIo1FafQlANyD54EUAGc4YHCe0eqxIwRCAEo7xEQXV9GsaWzQFq_sjuntukORBZB6VUwzv1dUdpj7yyLJHQnuf-0SGUbORqnUj5V0MD_GcEzIklbzk0JiroWF1vZnD_5aGZISxRJyFH_RWHW0IGdENNNbnO_eZkjUOsTiOi7DB-xyQAoM2Sg9GYS_LQT0j05BkmqozAx1R2ZlEi13v9I0itw56dJumjNzXUTjKIOaCahPb_lUmPFnZlIVFW-KWCAJoOlmr-ThJTUykcUe-H_BI-UPr3whLqIolGD1LLbGNMKkoMgjictGo6ZxXca-3SKBmWIasQ'
  if (!accessToken) {
    return res.status(401).send('Access token not found in session.');
  }

  const content = "Kuch Bhi...!!!";

  const linkedinUserID = await getLinkedInUserID(accessToken);
  if (!linkedinUserID) {
    return res.status(500).send('Error fetching LinkedIn user ID.');
  }

  try {
    const response = await axios.post('https://api.linkedin.com/v2/shares', {
      owner: `urn:li:person:${linkedinUserID}`,
      text: {
        text: content
      },
      distribution: {
        linkedInDistributionTarget: {}
      }
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(response.data);
    res.status(200).send('Content posted successfully on LinkedIn.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error posting content on LinkedIn.');
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
