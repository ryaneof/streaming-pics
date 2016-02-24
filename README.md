# [Streaming Pics](https://streaming.pics)

[![build status](https://img.shields.io/travis/ryaneof/streaming-pics/master.svg?style=flat-square)](https://travis-ci.org/ryaneof/streaming-pics)
[![Dependency Status](https://david-dm.org/ryaneof/streaming-pics.svg?style=flat-square)](https://david-dm.org/ryaneof/streaming-pics)
[![devDependency Status](https://david-dm.org/ryaneof/streaming-pics/dev-status.svg?style=flat-square)](https://david-dm.org/ryaneof/streaming-pics#info=devDependencies)

A simpler media timeline for Twitter.

## Features

- Display media from authenticated user's timeline (realtime).
- Display media from posted or liked tweets by a Twitter user.
- Display media from tweets in a public Twitter list.
- Display media from others' retweeted or quoted tweets.
- Display photos from tweets which contain an Instagram photo link.
- Like & Unlike a tweet.
- Support images, GIFs and videos uploaded from Twitter official clients.

## Browser Compatabilities

I won't support any fallback browsers such as IE 8 or even IE 6. Streaming Pics should be able to run smoothly on the latest version of Chrome, Safari, Firefox and IE Edge. Feel free to submit an issue if there's any problem.

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

# Development

npm run dev

# Production

npm build && npm start
```

## Contributing

Contributors are always welcome!

If you have some awesome idea about the feature, please submit an issue first.

If you want to fix something, please make sure the code would pass `npm run lint` checks and the basic test specs before sending the PR.

# License

[GPL V2](./LICENSE) (GPL-2.0)

# Acknowledgements

- Quite a lot of the code (mostly scaffold part) in this repo, came from [react-redux-universal-hot-example](https://github.com/ryaneof/streaming-pics)
- All the icons except the logo came from [evil-icons](http://evil-icons.io/)
