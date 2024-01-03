import {createServer} from 'http';
import {promisify} from 'util';
import 'dotenv/config';
import app from './app/index.js';

const server = createServer();
const listen = promisify(server.listen).bind(server);
const close = promisify(server.close).bind(server);

let serverIsStarting = false;
let serverHasStarted = false;
let serverShouldStop = false;

const startServer = async () => {
  console.log('Starting server');

  serverIsStarting = true;

  await listen(process.env.PORT || 8080, process.env.HOSTNAME || 'localhost');

  serverIsStarting = false;
  serverHasStarted = true;

  const {
    family: boundFamily,
    address: boundHostname,
    port: boundPort,
  } = server.address();

  const boundHostnameString = boundFamily === 'IPv6'
    ? `[${boundHostname}]`
    : boundHostname;

  console.log(`Server started at http://${boundHostnameString}:${boundPort}`);

  if (serverShouldStop) {
    await stopServer();
  }
};

const stopServer = async () => {
  try {
    console.log('Stopping server');

    await close();

    console.log('Server stopped');
  }
  catch (firstError) {
    if (firstError.code === 'ERR_SERVER_NOT_RUNNING') {
      if (serverIsStarting) {
        console.log('Server is starting. Will stop when started.');

        serverShouldStop = true;
      }
      else if (serverHasStarted) {
        console.log('Server has started. Will stop server.');

        await stopServer();
      }
      else {
        console.log('Server has not started and is not starting');
      }
    }
    else {
      throw firstError;
    }
  }
};

for (const eventName of ['SIGINT', 'SIGTERM']) {
  process.once(eventName, async () => {
    await stopServer();
  });
}

server.on('request', app);

startServer();
