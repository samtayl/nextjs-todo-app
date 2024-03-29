#!/usr/bin/env node

import 'dotenv/config';
import Server from '../server/index.js';

const server = new Server();

for (const eventName of ['SIGINT', 'SIGTERM']) {
  process.once(eventName, () => {
    server.stop();
  });
}

server.start();
