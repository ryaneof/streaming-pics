# [Streaming Pics](https://streaming.pics)

[![build status](https://img.shields.io/travis/ryaneof/streaming-pics/master.svg?style=flat-square)](https://travis-ci.org/ryaneof/streaming-pics)
[![Dependency Status](https://david-dm.org/ryaneof/streaming-pics.svg?style=flat-square)](https://david-dm.org/ryaneof/streaming-pics)
[![devDependency Status](https://david-dm.org/ryaneof/streaming-pics/dev-status.svg?style=flat-square)](https://david-dm.org/ryaneof/streaming-pics#info=devDependencies)

A simpler media timeline for Twitter.

## Requirements

- Node v5.6.0
- Redis v3.0.6
- [Twitter Developer Membership](https://dev.twitter.com/)

## Config

You can copy `.env.example` to `.env`, change the preset value, or set the following required environment variables by yourself.

```sh
# Check out https://apps.twitter.com/

TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
TWITTER_CALLBACK_URL

# Valid Redis connection string from https://github.com/luin/ioredis

SESSION_REDIS_CONNECT

# Session secret

SESSION_SECRET

# Google Analytics config

GOOGLE_ANALYTICS_TRACKING_ID
```

## Up & Running

```sh
npm install

### Development

npm run dev

### Production

npm build && npm start
```

# License

[GPL V2](./LICENSE) (GPL-2.0)

# Acknowledgements

- Quite a lot of the code (mostly scaffold part) in this repo, came from [react-redux-universal-hot-example](https://github.com/ryaneof/streaming-pics)
- All the icons except the logo came from [evil-icons](http://evil-icons.io/)
