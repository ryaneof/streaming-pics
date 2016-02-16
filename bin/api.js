#!/usr/bin/env node
if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({
    hook: true,
    ignore: /(\/\.|~$|\.json$)/i
  })) {
    return;
  }
}
require('../server.babel'); // babel registration (runtime transpilation for node)
require('../api/api');

process.on('uncaughtException', function (exception) {
  // handle or ignore error
  console.log('uncaughtException caught by process exception handler',  exception);
});