import {createServer} from 'http';
import {promisify} from 'util';
import 'dotenv/config';
import app from './app/index.js';

class Server {
  server = createServer();
  listen = promisify(this.server.listen).bind(this.server);
  close = promisify(this.server.close).bind(this.server);
  isStarting = false;
  hasStarted = false;
  shouldStop = false;

  constructor() {
    this.server.on('request', app);
  }

  async start() {
    console.log('Starting server');

    this.isStarting = true;

    await this.listen(process.env.PORT || 8080, process.env.HOSTNAME || 'localhost');

    this.isStarting = false;
    this.hasStarted = true;

    const {
      family: boundFamily,
      address: boundHostname,
      port: boundPort,
    } = this.server.address();

    const boundHostnameString = boundFamily === 'IPv6'
      ? `[${boundHostname}]`
      : boundHostname;

    console.log(`Server started at http://${boundHostnameString}:${boundPort}`);

    if (this.shouldStop) {
      await this.stop();
    }
  }

  async stop() {
    try {
      console.log('Stopping server');

      await this.close();

      console.log('Server stopped');
    }
    catch (error) {
      if (error.code === 'ERR_SERVER_NOT_RUNNING') {
        if (this.isStarting) {
          console.log('Server is starting. Will stop when started.');

          this.shouldStop = true;
        }
        else if (this.hasStarted) {
          console.log('Server has started. Will stop server.');

          await this.stop();
        }
        else {
          console.log('Server has not started and is not starting');
        }
      }
      else {
        throw error;
      }
    }
  }
}

export default Server;
