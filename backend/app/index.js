import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';

import {
  hsts,
  noSniff,
  hidePoweredBy,
  frameguard,
  contentSecurityPolicy,
} from 'helmet';

import hpp from 'hpp';
import xssClean from 'xss-clean';
import 'dotenv/config';
import {validateAccessToken} from './middleware/auth.js';
import profileRouter from './routes/profile.js';

const app = express();

app.set('trust proxy', 1);

// parse request body and attach it to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// remove duplicate params
app.use(hpp({
  keepFirst: true,
}));

// sanatize req.body, req.query, and req.params
app.use(xssClean());

// remove x-powered-by header
app.use(hidePoweredBy());

// add cors headers
app.use(cors({
  origin: process.env.CLIENT_ORIGIN_URL,
}));

// add strict-transport-security header
app.use(hsts());

// add x-content-type-options header
app.use(noSniff());

// add x-frame-options header
app.use(frameguard({
  action: 'deny',
}));

// add content-security-policy header
app.use(contentSecurityPolicy({
  useDefaults: false,
  directives: {
    defaultSrc: 'none',
  },
}));

// compress response body
app.use(compression());

// validate access token
app.use(validateAccessToken);

// add routes
app.use('/profile', profileRouter);

export default app;
