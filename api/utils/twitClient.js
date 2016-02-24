import Twit from 'twit';
import nconf from 'nconf';

nconf.env();

export function createTwitClient(user) {
  return new Twit({
    consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
    consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
    access_token: user.token,
    access_token_secret: user.tokenSecret
  });
}
