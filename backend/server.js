import {createServer} from 'http';
import {promisify} from 'util';
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
    console.log('Stopping server');

    if (this.state === SERVER_STATES.STARTED) {
      this.state = SERVER_STATES.STOPPING;

      await this.close();

      this.state = SERVER_STATES.STOPPED;

      console.log('Server stopped');
    }
    else if (this.state === SERVER_STATES.STARTING) {
      console.log('Server is starting. Will stop when started.');

      this.shouldStop = true;
    }
    else if (this.state === SERVER_STATES.STOPPING) {
      console.log('Server is already stopping');
    }
    else {
      console.log('Server has not started and is not starting');
    }
  }
}

export default Server;
