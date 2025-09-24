import { Router } from 'express';
import { authController } from '../Controllers/authController';

const router = Router();

router.post('/register', async (req, res, next) => {
  await authController.register(req, res, next);
});

router.post('/login', async (req, res, next) => {
  await authController.login(req, res, next);
});

export default router;
