require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  env: process.env.NODE_ENV,
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT,
  apiHost: process.env.APIHOST || '127.0.0.1',
  apiPort: process.env.APIPORT,
  gaTrackId: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
  app: {
    title: 'Streaming Pics',
    description: 'A simpler media timeline for Twitter.',
    head: {
      titleTemplate: '%s | Streaming Pics',
      meta: [
        { name: 'description', content: 'A simpler media timeline for Twitter.' },
        { charset: 'utf-8' },
        { property: 'og:site_name', content: 'Streaming Pics'},
        { property: 'og:image', content: 'https://streaming.pics/logo.png' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:title', content: 'Streaming Pics' },
        { property: 'og:description', content: 'A simpler media timeline for Twitter.' },
        { property: 'og:card', content: 'summary' },
        { property: 'og:site', content: '@ryaneof' },
        { property: 'og:creator', content: '@ryaneof' },
        { property: 'og:image:width', content: '200' },
        { property: 'og:image:height', content: '200 '}
      ]
    }
  },

}, environment);
