import {createServer} from 'http';
import 'dotenv/config';
import app from './app/index.js';

const server = createServer();

const startServer = async () => {
  console.log('Starting server');

  await new Promise((resolve, reject) => {
    server.listen(
      process.env.PORT || 8080,
      process.env.HOSTNAME || 'localhost',
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });

  const {
    family: boundFamily,
    address: boundHostname,
    port: boundPort,
  } = server.address();

  const boundHostnameString = boundFamily === 'IPv6'
    ? `[${boundHostname}]`
    : boundHostname;

  console.log(`Server started at http://${boundHostnameString}:${boundPort}`);
};

const stopServer = async () => {
  try {
    console.log('Stopping server');

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    console.log('Server stopped');
  }
  catch (firstError) {
    if (firstError.code === 'ERR_SERVER_NOT_RUNNING') {
      console.log('Server is not running. If server is starting, will stop once started.');

      await new Promise((resolve, reject) => {
        server.once('listening', async () => {
          try {
            await stopServer();
            resolve();
          }
          catch (secondError) {
            reject(secondError);
          }
        });
      });
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

await startServer();
