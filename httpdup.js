#!/usr/bin/env node
'use strict';

const duplicator = require('duplicator');
const EventEmitter = require('events');
const yargs = require('yargs');
const HostHeaderTransform = require('./lib/host-header-transform');

const {argv} = yargs
  .help(false)
  .option('help', {
    alias: 'h',
    type: 'boolean',
    describe: 'Show help'
  })
  .option('listen', {
    alias: 'l',
    type: 'number',
    default: 80,
    describe: 'Port to listen on'
  })
  .option('primary', {
    alias: 'p',
    type: 'string',
    describe: 'Host providing the response'
  })
  .option('secondary', {
    alias: 's',
    type: 'array',
    describe: 'Host(s) to duplicate to'
  })
  .option('keep-host', {
    alias: 'k',
    type: 'boolean',
    describe: 'Do not modify HTTP Host header'
  })
  .epilogue('At least one primary or secondary host is required.');


const serverGiven = argv.primary || (argv.secondary && argv.secondary.length);
if (argv.help || !serverGiven) {
  yargs.showHelp();
  process.exit(1);
}

if (argv.secondary) {
  // Allow extra event bindigns for secondary hosts, otherwise we'll get
  // "possble EventEmitter memory leak detected" with 10+ hosts
  EventEmitter.defaultMaxListeners += argv.secondary.length;
}

duplicator(function(stream, forward, duplicate) {
  if (argv.primary) {
    forward(argv.primary);
  }
  (argv.secondary || []).forEach((host) => {
    host = String(host);
    if (argv.keepHost) {
      duplicate(host);
    } else {
      duplicate(host, stream.pipe(new HostHeaderTransform(host)));
    }
  });
})
  .listen(argv.listen)
  .on('listening', () => console.log(`Listening on port ${argv.listen}`));