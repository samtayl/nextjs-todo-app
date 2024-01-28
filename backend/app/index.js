import express from 'express';
import {validateAccessToken} from './middleware/auth.js';
import profileRouter from './routes/profile.js';

const app = express();

// validate access token
app.use(validateAccessToken);

// add routes
app.use('/profile', profileRouter);

export default app;
