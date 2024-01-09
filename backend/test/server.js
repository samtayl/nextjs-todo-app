import {spawn} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';
import waitOn from 'wait-on';

const filepath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filepath);

dotenv.config({path: path.resolve(dirname, 'fixtures/.env')});

const startServerScriptPath = path.resolve(dirname, '../bin/serve.js');
const fixturesPath = path.resolve(dirname, 'fixtures');

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
