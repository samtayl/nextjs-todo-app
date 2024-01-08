#!/usr/bin/env node

import Server from '../server.js';

const server = new Server();

for (const eventName of ['SIGINT', 'SIGTERM']) {
  process.once(eventName, () => {
    server.stop();
  });
}

server.start();
