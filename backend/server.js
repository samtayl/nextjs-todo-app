import {createServer} from 'http';
import {promisify} from 'util';
import 'dotenv/config';
import app from './app/index.js';

const SERVER_STATES = {
  STARTING: Symbol('STARTING'),
  STARTED: Symbol('STARTED'),
  STOPPING: Symbol('STOPPING'),
  STOPPED: Symbol('STOPPED'),
};

class Server {
  server = createServer();
  listen = promisify(this.server.listen).bind(this.server);
  close = promisify(this.server.close).bind(this.server);
  state = SERVER_STATES.STOPPED;
  shouldStop = false;

  constructor() {
    this.server.on('request', app);
  }

  async start() {
    console.log('Starting server');

    this.state = SERVER_STATES.STARTING;

    await this.listen(process.env.PORT || 8080, process.env.HOSTNAME || 'localhost');

    this.state = SERVER_STATES.STARTED;

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

      this.state = SERVER_STATES.STOPPING;

      await this.close();

      this.state = SERVER_STATES.STOPPED;

      console.log('Server stopped');
    }
    catch (error) {
      if (error.code === 'ERR_SERVER_NOT_RUNNING') {
        if (this.state === SERVER_STATES.STARTING) {
          console.log('Server is starting. Will stop when started.');

          this.shouldStop = true;
        }
        else if (this.state === SERVER_STATES.STARTED) {
          console.log('Server has started. Will stop server.');

          await this.stop();
        }
        else if (this.state === SERVER_STATES.STOPPING) {
          console.log('Server is already stopping');
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
