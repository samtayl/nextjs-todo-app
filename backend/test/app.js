import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {jest} from '@jest/globals';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import request from 'supertest';

class UnauthorizedError extends Error {
  statusCode = 401;
  headers = {
    'WWW-Authenticate': 'Bearer realm="api"',
  };
}

const signJwt = promisify(jwt.sign);
const verifyJwt = promisify(jwt.verify);
const filepath = fileURLToPath(import.meta.url);
const dirname = path.dirname(filepath);

dotenv.config({path: path.resolve(dirname, 'fixtures/.env')});

const token = await signJwt({}, process.env.DUMMY_JWT_SECRET);

jest.unstable_mockModule('../app/middleware/auth.js', () => ({
  async validateAccessToken(req, res, next) {
    const {
      headers: {
        authorization: authorizationHeader,
      } = {},
    } = req;

    if (!authorizationHeader) {
      next(new UnauthorizedError());
      return;
    }

    const [, recievedToken] = authorizationHeader.match(/^Bearer (.+)$/iu);

    try {
      await verifyJwt(recievedToken, process.env.DUMMY_JWT_SECRET);
    }
    catch {
      next(new UnauthorizedError());
      return;
    }

    next();
  },
}));

// app/index.js has to be imported dynamically because it initializes middleware with
// environment variables. Envrionment variables are set by dotenv.config(), which, because
// static imports are hoisted, would execute after the middleware was already initialized
// if app/index.js were imported statically. Furthermore, the static import variant of
// `dotenv.config()`, `import dotenv/config`, cannot be used because we are passing arguments
// to `dotenv.config()`.

const {default: app} = await import('../app/index.js');

test('send johndoe\'s profile if valid authentication credentials are sent', async () => {
  await request(app)
    .get('/profile')
    .set('Authorization', 'Bearer ' + token)
    .expect(200, {username: 'johndoe'});
});

test('send a 401 status code if no authentication credentials are sent', async () => {
  await request(app)
    .get('/profile')
    .expect(401);
});

test('send a 401 status code if incorrect authentication credentials are sent', async () => {
  const incorrectToken = await signJwt({}, 'wrong secret');

  expect(incorrectToken).not.toBe(token);

  await request(app)
    .get('/profile')
    .set('Authorization', 'Bearer ' + incorrectToken)
    .expect(401);
});
