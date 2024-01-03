const {spawn} = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const waitOn = require('wait-on');

dotenv.config({path: path.resolve(__dirname, 'fixtures/.env')});

const startServerScriptPath = path.resolve(__dirname, '../server.js');
const fixturesPath = path.resolve(__dirname, 'fixtures');

test('the server starts', async () => {
  const childProcess = spawn('node', [startServerScriptPath], {cwd: fixturesPath});

  await expect(waitOn({
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
    validateStatus(status) {
      return typeof status === 'number';
    },
  })).resolves.toBeUndefined();

  childProcess.kill();
});

test('the server stops on SIGTERM', async () => {
  const childProcess = spawn('node', [startServerScriptPath], {cwd: fixturesPath});

  await waitOn({
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
    validateStatus(status) {
      return typeof status === 'number';
    },
  });

  childProcess.kill('SIGTERM');

  await expect(waitOn({
    reverse: true,
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
  })).resolves.toBeUndefined();
});

test('the server stops on SIGINT', async () => {
  const childProcess = spawn('node', [startServerScriptPath], {cwd: fixturesPath});

  await waitOn({
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
    validateStatus(status) {
      return typeof status === 'number';
    },
  });

  childProcess.kill('SIGINT');

  await expect(waitOn({
    reverse: true,
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
  })).resolves.toBeUndefined();
});

test('the server stops if signal is sent while server may be starting', async () => {
  const childProcess = spawn('node', [startServerScriptPath], {cwd: fixturesPath});

  childProcess.kill();

  await expect(waitOn({
    reverse: true,
    resources: [
      `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    ],
  })).resolves.toBeUndefined();
});
