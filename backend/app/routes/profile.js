import {Router} from 'express';

const profileRouter = new Router();

const profile = {
  username: 'johndoe',
};

profileRouter.get('/', (req, res) => {
  res.json(profile);
});

export default profileRouter;
