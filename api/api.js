import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import ioRedis from 'ioredis';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import * as dataSources from './dataSources/index';
import { mapUrl } from 'utils/url.js';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';
import SocketIoExpressSession from 'socket.io-express-session';
import nconf from 'nconf';
import passport from 'passport';
import TwitterStrategy from 'passport-twitter';

nconf.env();

console.info('----');
console.info(`==> 🌚  ENV: TWITTER_CONSUMER_KEY=${ nconf.get('TWITTER_CONSUMER_KEY') }`);
console.info(`==> 🌚  ENV: TWITTER_CONSUMER_SECRET=${ nconf.get('TWITTER_CONSUMER_SECRET') }`);
console.info(`==> 🌚  ENV: TWITTER_CALLBACK_URL=${ nconf.get('TWITTER_CALLBACK_URL') }`);
console.info(`==> 🌚  ENV: SESSION_REDIS_CONNECT=${ nconf.get('SESSION_REDIS_CONNECT') }`);
console.info(`==> 🌚  ENV: SESSION_SECRET=${ nconf.get('SESSION_SECRET') }`);
console.info(`==> 🌚  ENV: GOOGLE_ANALYTICS_TRACKING_ID=${ nconf.get('GOOGLE_ANALYTICS_TRACKING_ID') }`);

const pretty = new PrettyError();
const app = express();
const server = new http.Server(app);
const io = new SocketIo(server);
const redisClient = ioRedis.createClient(nconf.get('SESSION_REDIS_CONNECT'));
const RedisStore = connectRedis(session);
const sessionStore = new RedisStore({
  client: redisClient
});

io.path('/ws');

passport.use(
  new TwitterStrategy({
    consumerKey: nconf.get('TWITTER_CONSUMER_KEY'),
    consumerSecret: nconf.get('TWITTER_CONSUMER_SECRET'),
    callbackURL: nconf.get('TWITTER_CALLBACK_URL')
  },
  (token, tokenSecret, profile, done) => {
    let { username, displayName, _json } = profile;
    let profileImageURL = _json.profile_image_url_https.replace(/\_normal/, '_bigger');

    // only store these in session
    return done(null, {
      username,
      displayName,
      profileImageURL,
      token,
      tokenSecret
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

var expressSession = session({
  secret: nconf.get('SESSION_SECRET') || 'streaming-pics',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  store: sessionStore
});

app.use(morgan('short'));
app.use(cookieParser());
app.use(expressSession);
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/api/auth/twitter/failed' }),
  (req, res) => {
    // Successful Auth
    res.redirect('/home');
  }
);

app.get('/auth/twitter/failed', (req, res) => {
  // Failed Auth
  // todo Proper Views
  res.status(400);
  res.send('Oops, twitter auth failed, please <a href="/auth/twitter">try again</a>');
  res.end();
});

app.use((req, res) => {
  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

  const {action, params} = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        if (result instanceof Function) {
          result(res);
        } else {
          res.json( result);
        }
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', config.apiHost, config.apiPort);
  });

  io.use(SocketIoExpressSession(expressSession));

  io.on('connection', (socket) => {
    let userStreamSocket, userTimelineStatuses, favoriteStatuses;

    // Home Timeline + User Streaming
    socket.on('getUserStream', () => {
      console.info('==> 😎  user stream started.');
      userStreamSocket = dataSources.userStream(socket);
    });

    socket.on('disconnectUserStream', () => {
      if (userStreamSocket) {
        console.info('==> 🙀  user stream disconnected.');
        userStreamSocket.stop();
      }
    });

    // Specified User Timeline
    // todo: as a real stream, handle protected users' timeline
    socket.on('initUserTimelineStatuses', (user) => {
      const { userScreenName } = user;
      dataSources.userTimelineStatuses(socket, userScreenName);
    });

    // User Liked Statuses
    socket.on('initFavoriteStatuses', (user) => {
      const { userScreenName } = user;
      dataSources.favoriteStatuses(socket, userScreenName);
    });

    socket.on('initListStatuses', (listStatusesParams) => {
      dataSources.listStatuses(socket, listStatusesParams);
    });
  });

  io.listen(runnable);

} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
